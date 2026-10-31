// src/app/api/negotiations/[id]/public/route.ts
import { NextResponse } from "next/server";
import { store } from "@/server/store";
import { toPublicNegotiationState } from "@/server/serialization";
import type { NegotiationState } from "@/types/negotiation";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const state = store.get(id) as NegotiationState | undefined;
  if (!state) {
    return NextResponse.json({ error: "Negotiation not found" }, { status: 404 });
  }
  const publicState = toPublicNegotiationState(state, id);
  return NextResponse.json(publicState, { status: 200 });
}
