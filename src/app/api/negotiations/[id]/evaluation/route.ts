// src/app/api/negotiations/[id]/evaluation/route.ts
import { NextResponse, NextRequest } from "next/server";
import { store } from "@/server/store";
import { evaluateNegotiation } from "@/server/evaluation/evaluator";
import type { NegotiationState } from "@/types/negotiation";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const state = store.get(id) as NegotiationState | undefined;

  if (!state) {
    return NextResponse.json({ error: "Negotiation not found" }, { status: 404 });
  }

  try {
    const evaluation = evaluateNegotiation(state);
    return NextResponse.json(evaluation, { status: 200 });
  } catch (err: any) {
    console.error("Evaluation error:", err);
    return NextResponse.json({ error: err.message || "Failed to evaluate negotiation" }, { status: 500 });
  }
}

