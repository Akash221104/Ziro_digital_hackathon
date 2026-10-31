// src/server/serialization.ts
import { NegotiationState } from "@/types/negotiation";

/**
 * Public representation of a negotiation that can be safely sent to a candidate.
 * All HR‑only fields are stripped out.
 */
export interface PublicNegotiationState {
  // Identifier of the negotiation (optional, can be added by the caller)
  id?: string;
  // Candidate public profile (no private HR data)
  candidate: {
    id: string;
    name: string;
    email?: string;
    resumeUrl?: string;
    documents: {
      id: string;
      name: string;
      url: string;
      type: string;
    }[];
    interviewScores: {
      interviewId: string;
      type: "technical" | "hr";
      score: number;
      notes?: string;
    }[];
  };
  currentOffer: number;
  candidateDemand?: number;
  agentOffer?: number;
  round: number;
  status: "ongoing" | "completed" | "failed";
  humanApprovalNeeded?: boolean;
  history: {
    speaker: "candidate" | "agent" | "human";
    message: string;
    timestamp: string;
  }[];
}

/**
 * Convert full internal NegotiationState to a safe public version.
 * Guarantees that no HR private data leaks.
 */
export function toPublicNegotiationState(
  state: NegotiationState,
  id?: string
): PublicNegotiationState {
  const { candidate, currentOffer, candidateDemand, agentOffer, round, status, humanApprovalNeeded, history } = state;
  return {
    id,
    candidate: {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      resumeUrl: candidate.resumeUrl,
      documents: candidate.documents.map((doc) => ({
        id: doc.id,
        name: doc.name,
        url: doc.url,
        type: doc.type,
      })),
      interviewScores: candidate.interviewScores.map((s) => ({
        interviewId: s.interviewId,
        type: s.type,
        score: s.score,
        notes: s.notes,
      })),
    },
    currentOffer,
    candidateDemand,
    agentOffer,
    round,
    status,
    humanApprovalNeeded,
    history: history.map((e) => ({
      speaker: e.speaker,
      message: e.message,
      timestamp: e.timestamp,
    })),
  };
}
