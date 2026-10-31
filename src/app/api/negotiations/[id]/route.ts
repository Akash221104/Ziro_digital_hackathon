// src/app/api/negotiations/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { store } from "@/server/store";
import { NegotiationState } from "@/types/negotiation";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const state = store.get(id) as NegotiationState | undefined;
  if (!state) {
    return NextResponse.json({ error: "Negotiation not found" }, { status: 404 });
  }
  // Return full internal state – HR internal use only
  return NextResponse.json({ id, ...state }, { status: 200 });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const state = store.get(id) as NegotiationState | undefined;
  if (!state) {
    return NextResponse.json({ error: "Negotiation not found" }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    if (body.status === "completed") {
      state.status = "completed";
      state.updatedAt = new Date().toISOString();
      store.set(id, state);
    }
    return NextResponse.json({ id, ...state }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update" }, { status: 400 });
  }
}

