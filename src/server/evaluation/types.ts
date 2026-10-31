// src/server/evaluation/types.ts
import { z } from "zod";

export const ReplayEventTypeEnum = z.enum([
  "INITIAL_ANCHOR",
  "COMPETING_OFFER",
  "JUSTIFICATION",
  "COUNTER_OFFER",
  "CANDIDATE_CONCESSION",
  "AI_CONCESSION",
  "TOOL_USAGE",
  "HUMAN_APPROVAL",
  "REJECTION",
  "FINAL_OFFER",
  "NEGOTIATION_END",
]);

export type ReplayEventType = z.infer<typeof ReplayEventTypeEnum>;

export const ReplayEventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  type: ReplayEventTypeEnum,
  title: z.string(),
  candidateStatement: z.string().optional(),
  aiResponse: z.string().optional(),
  hrExplanation: z.string(),
});

export type ReplayEvent = z.infer<typeof ReplayEventSchema>;

export const DimensionScoreSchema = z.object({
  score: z.number().min(0),
  max: z.number().positive(),
  reason: z.string(),
});

export type DimensionScore = z.infer<typeof DimensionScoreSchema>;

export const EvaluationResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  dimensions: z.object({
    anchoring: DimensionScoreSchema,
    justification: DimensionScoreSchema,
    marketAwareness: DimensionScoreSchema,
    leverage: DimensionScoreSchema,
    timing: DimensionScoreSchema,
    finalOutcome: DimensionScoreSchema,
  }),
  salaryMetrics: z.object({
    initialOffer: z.number(),
    candidateInitialAsk: z.number().optional(),
    finalOffer: z.number(),
    hiddenMaximum: z.number(),
    maximumAchievedPercent: z.number(),
  }),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  keyMoments: z.array(ReplayEventSchema),
});

export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;

