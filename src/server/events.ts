// src/server/events.ts
/**
 * Enumeration of negotiation event types – useful for logging / analytics.
 * Not exported as a type for the public API; internal use only.
 */
export const NegotiationEventType = {
  NEGOTIATION_STARTED: "NEGOTIATION_STARTED",
  CANDIDATE_MESSAGE: "CANDIDATE_MESSAGE",
  OFFER_MADE: "OFFER_MADE",
  CANDIDATE_COUNTER: "CANDIDATE_COUNTER",
  AGENT_ACTION: "AGENT_ACTION",
  TOOL_CALL: "TOOL_CALL",
  HUMAN_APPROVAL_REQUESTED: "HUMAN_APPROVAL_REQUESTED",
  HUMAN_APPROVAL_APPROVED: "HUMAN_APPROVAL_APPROVED",
  HUMAN_APPROVAL_MODIFIED: "HUMAN_APPROVAL_MODIFIED",
  HUMAN_APPROVAL_REJECTED: "HUMAN_APPROVAL_REJECTED",
  NEGOTIATION_COMPLETED: "NEGOTIATION_COMPLETED",
} as const;

export type NegotiationEventType = typeof NegotiationEventType[keyof typeof NegotiationEventType];
