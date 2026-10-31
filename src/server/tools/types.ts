// src/server/tools/types.ts
/** Common result type for all tools */
export type ToolResult<T = unknown> = {
  /** Did the tool succeed? */
  success: boolean;
  /** Name of the tool */
  tool: string;
  /** Raw data returned by the tool */
  data: T;
  /** Human‑readable summary for candidate‑facing messages */
  summary: string;
};

/** Input types for individual tools */
export type SalaryBenchmarkInput = {
  role: string;
  experience: string;
  location: string;
  skills?: string[];
};

export type CompensationInput = {
  baseSalary: number;
  bonus?: number;
  joiningBonus?: number;
  currentOffer: number;
};

export type CandidateSignalInput = {
  candidateMessage: string;
  interviewScores: { type: "technical" | "hr"; score: number }[];
  round: number;
};
