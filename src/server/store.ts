// src/server/store.ts
/**
 * Simple in‑memory store for negotiation state. For the hackathon this is sufficient.
 * In production this would be replaced by a persistent DB (e.g., PostgreSQL, Prisma).
 */
import { NegotiationState } from "../types/negotiation";

/** Map keyed by a UUID negotiation ID */
const negotiationMap = new Map<string, NegotiationState>();

export const store = {
  /** Get existing state or undefined */
  get: (id: string): NegotiationState | undefined => negotiationMap.get(id),
  /** Save or replace a negotiation state */
  set: (id: string, state: NegotiationState) => negotiationMap.set(id, state),
  /** Delete a negotiation (cleanup) */
  delete: (id: string) => negotiationMap.delete(id),
  /** List all IDs – useful for debugging */
  listIds: (): string[] => Array.from(negotiationMap.keys()),
};
