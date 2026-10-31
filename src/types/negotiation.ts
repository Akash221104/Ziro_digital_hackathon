// src/types/negotiation.ts

/** Core domain types for the HR Salary Negotiation Agent */

/** Candidate profile information */
export interface CandidateProfile {
  id: string;
  name: string;
  email?: string;
  /** URL to the uploaded resume (e.g., stored in cloud storage) */
  resumeUrl?: string;
  documents: CandidateDocument[];
  interviewScores: InterviewScore[];
}

/** Supporting document attached to a candidate */
export interface CandidateDocument {
  id: string;
  name: string;
  /** Publicly accessible URL (candidate cannot see private HR data) */
  url: string;
  /** MIME type or custom classification */
  type: string;
}

/** Score from a past interview */
export interface InterviewScore {
  interviewId: string;
  /** "technical" or "hr" */
  type: "technical" | "hr";
  score: number; // 0‑100 scale
  notes?: string;
}

/** Private HR‑only state that must never be exposed to the candidate */
export interface HRPrivateState {
  /** Salary the HR wishes to reach */
  targetSalary: number;
  /** Absolute upper bound the company can spend */
  maxBudget: number;
  /** Any internal evaluation scores (e.g., cultural fit) */
  internalScores: Record<string, number>;
}

/** A single step in the negotiation conversation */
export interface NegotiationEvent {
  speaker: "candidate" | "agent" | "human";
  message: string;
  /** ISO timestamp */
  timestamp: string;
}

/** Possible actions the AI agent can take */
export type AgentDecisionAction =
  | "ASK_CONTEXTUAL_QUESTION"
  | "ASK_JUSTIFICATION"
  | "MAKE_COUNTER_OFFER"
  | "HOLD_POSITION"
  | "MAKE_CONCESSION"
  | "REJECT_REQUEST"
  | "OFFER_ALTERNATIVE"
  | "USE_TOOL"
  | "REQUEST_HUMAN_APPROVAL"
  | "END_NEGOTIATION";

/** Structured decision emitted by the agent */
export interface AgentDecision {
  action: AgentDecisionAction;
  /** Optional payload depending on the action */
  payload?: Record<string, any>;
}

/** Tool invocation description */
export interface ToolCall {
  toolName: string;
  args: Record<string, any>;
  /** Result will be filled after execution */
  result?: any;
}

/** Evidence supplied by the candidate (e.g., salary expectation, market data) */
export interface CandidateEvidence {
  type: string;
  content: any;
}

/** Overall negotiation state stored on the server */
export interface NegotiationState {
  id?: string;
  role?: string;
  createdAt?: string;
  /** Candidate specific data */
  candidate: CandidateProfile;
  /** HR‑only private data */
  hrPrivate: HRPrivateState;
  /** Current salary offer from HR */
  currentOffer: number;
  /** Latest demand expressed by the candidate */
  candidateDemand?: number;
  /** Counter‑offer made by the agent (if any) */
  agentOffer?: number;
  /** Current round number */
  round: number;
  /** Full conversation/history */
  history: NegotiationEvent[];
  /** Tools used and their outcomes */
  toolCalls: ToolCall[];
  /** Negotiation status */
  status: "ongoing" | "completed" | "failed";
  /** Does the next step require human approval? */
  humanApprovalNeeded?: boolean;
  // Human approval state
  humanApproval?: {
    status: "NOT_REQUIRED" | "PENDING" | "APPROVED" | "MODIFIED" | "REJECTED";
    requestedAt?: string;
    requestedOffer?: number;
    reason?: string;
    reviewedAt?: string;
    approvedOffer?: number;
    reviewerNote?: string;
  };
}
