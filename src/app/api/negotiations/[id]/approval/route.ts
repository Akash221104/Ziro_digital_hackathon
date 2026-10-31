// src/app/api/negotiations/[id]/approval/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/server/store";
import { NegotiationEventType } from "@/server/events";
import type { NegotiationState } from "@/types/negotiation";

const ApprovalSchema = z.object({
  decision: z.enum(["APPROVE", "MODIFY", "REJECT"]),
  approvedOffer: z.number().optional(),
  reviewerNote: z.string().optional(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const state = store.get(id) as NegotiationState | undefined;
  if (!state) {
    return NextResponse.json({ error: "Negotiation not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { decision, approvedOffer, reviewerNote } = ApprovalSchema.parse(body);

    const now = new Date().toISOString();

    // Ensure a pending approval exists
    if (!state.humanApproval || state.humanApproval.status !== "PENDING") {
      return NextResponse.json({ error: "No pending human approval" }, { status: 400 });
    }

    // Update humanApproval based on decision
    switch (decision) {
      case "APPROVE": {
        state.humanApproval = {
          ...state.humanApproval,
          status: "APPROVED",
          reviewedAt: now,
          approvedOffer: state.humanApproval.requestedOffer,
        };
        state.history.push({
          type: NegotiationEventType.HUMAN_APPROVAL_APPROVED,
          timestamp: now,
          details: { approvedOffer: state.humanApproval.requestedOffer },
        } as any);
        break;
      }
      case "MODIFY": {
        if (typeof approvedOffer !== "number") {
          return NextResponse.json({ error: "approvedOffer required for MODIFY" }, { status: 400 });
        }
        state.humanApproval = {
          ...state.humanApproval,
          status: "MODIFIED",
          reviewedAt: now,
          approvedOffer,
          reviewerNote: reviewerNote ?? "",
        };
        state.history.push({
          type: NegotiationEventType.HUMAN_APPROVAL_MODIFIED,
          timestamp: now,
          details: { approvedOffer, reviewerNote },
        } as any);
        // Apply modified offer to negotiation state
        state.currentOffer = approvedOffer;
        state.agentOffer = approvedOffer;
        break;
      }
      case "REJECT": {
        state.humanApproval = {
          ...state.humanApproval,
          status: "REJECTED",
          reviewedAt: now,
          reviewerNote: reviewerNote ?? "",
        };
        state.history.push({
          type: NegotiationEventType.HUMAN_APPROVAL_REJECTED,
          timestamp: now,
          details: { reviewerNote },
        } as any);
        break;
      }
    }

    // Persist updated state
    store.set(id, state);

    return NextResponse.json({ success: true, status: state.humanApproval?.status });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid request" }, { status: 400 });
  }
}
