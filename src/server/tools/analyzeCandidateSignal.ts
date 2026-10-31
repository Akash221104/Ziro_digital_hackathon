// src/server/tools/analyzeCandidateSignal.ts
import { ToolResult, CandidateSignalInput } from "./types";

/** Simple analysis of candidate's message and interview scores */
export function analyzeCandidateSignal(input: CandidateSignalInput): ToolResult<{ sentiment: string; priority: string }> {
  const { candidateMessage, interviewScores, round } = input;
  // naive sentiment based on presence of keywords
  const lower = candidateMessage.toLowerCase();
  const positive = /accept|agree|happy|great/.test(lower);
  const negative = /not|cannot|unhappy|disagree/.test(lower);
  const sentiment = positive ? "positive" : negative ? "negative" : "neutral";
  // prioritize if high technical score
  const techScore = interviewScores.find((s) => s.type === "technical")?.score ?? 0;
  const priority = techScore >= 80 ? "high" : "normal";
  const summary = `Round ${round} candidate signal is ${sentiment} (priority: ${priority}).`;
  return {
    success: true,
    tool: "analyzeCandidateSignal",
    data: { sentiment, priority },
    summary,
  };
}
