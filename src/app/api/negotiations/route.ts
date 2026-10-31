// src/app/api/negotiations/route.ts
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { store } from "@/server/store";
import { NegotiationState, CandidateProfile, HRPrivateState, NegotiationEvent } from "@/types/negotiation";

// Zod schema for incoming payload
const CreateNegotiationSchema = z.object({
  // candidate public details
  candidate: z.object({
    id: z.string().optional(),
    name: z.string(),
    email: z.string().optional(),
    resumeUrl: z.string().optional(),
    documents: z.array(
      z.object({
        id: z.string().optional(),
        name: z.string(),
        url: z.string(),
        type: z.string(),
      })
    ).optional().default([]),
    interviewScores: z.array(
      z.object({
        interviewId: z.string(),
        type: z.enum(["technical", "hr"]),
        score: z.number().min(0).max(100),
        notes: z.string().optional(),
      })
    ).optional().default([]),
  }),
  role: z.string().optional().default("Software Engineer"),
  experience: z.union([z.string(), z.number()]).optional(),
  location: z.string().optional(),
  resume: z.string().optional(),
  previousInterviewScores: z.object({
    technical: z.number().optional(),
    hr: z.number().optional(),
    notes: z.string().optional(),
  }).optional(),
  // initial negotiation parameters
  initialOffer: z.number().positive(),
  expectedSalary: z.number().positive().optional(),
  // HR‑only private fields (must stay server‑side)
  hrPrivate: z.object({
    targetSalary: z.number().positive(),
    maxBudget: z.number().positive(),
    constraints: z.string().optional(),
    internalScores: z.record(z.string(), z.number()).optional().default({}),
  }),
});

export async function GET() {
  const ids = store.listIds();
  const negotiations = ids.map((id) => {
    const s = store.get(id);
    return {
      id,
      ...s,
    };
  });
  return NextResponse.json({ negotiations }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateNegotiationSchema.parse(body);

    const negotiationId = crypto.randomUUID();
    const candidateId = parsed.candidate.id ?? crypto.randomUUID();

    const interviewScores = [...parsed.candidate.interviewScores];
    if (parsed.previousInterviewScores) {
      if (parsed.previousInterviewScores.technical !== undefined) {
        interviewScores.push({
          interviewId: "tech-1",
          type: "technical",
          score: parsed.previousInterviewScores.technical,
          notes: parsed.previousInterviewScores.notes,
        });
      }
      if (parsed.previousInterviewScores.hr !== undefined) {
        interviewScores.push({
          interviewId: "hr-1",
          type: "hr",
          score: parsed.previousInterviewScores.hr,
          notes: parsed.previousInterviewScores.notes,
        });
      }
    }

    const enrichedCandidate: CandidateProfile = {
      ...parsed.candidate,
      id: candidateId,
      resumeUrl: parsed.candidate.resumeUrl ?? parsed.resume,
      documents: parsed.candidate.documents.map((d) => ({
        ...d,
        id: d.id ?? crypto.randomUUID(),
      })),
      interviewScores,
    };

    const hrState: HRPrivateState = {
      targetSalary: parsed.hrPrivate.targetSalary,
      maxBudget: parsed.hrPrivate.maxBudget,
      internalScores: parsed.hrPrivate.internalScores as Record<string, number>,
    };

    // Initial history event – negotiation started
    const startEvent: NegotiationEvent = {
      speaker: "agent",
      message: `Hello ${parsed.candidate.name}, welcome! We are thrilled by your interview results and excited to discuss the compensation package for the ${parsed.role} role. Our initial formal offer is ₹${parsed.initialOffer.toLocaleString("en-IN")}. How does this align with your expectations?`,
      timestamp: new Date().toISOString(),
    };

    const initialState: NegotiationState = {
      id: negotiationId,
      role: parsed.role,
      createdAt: new Date().toISOString(),
      candidate: enrichedCandidate,
      hrPrivate: hrState,
      currentOffer: parsed.initialOffer,
      candidateDemand: parsed.expectedSalary,
      round: 0,
      history: [startEvent],
      toolCalls: [],
      status: "ongoing",
    };

    store.set(negotiationId, initialState);

    return NextResponse.json({ id: negotiationId, negotiationId }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid request" }, { status: 400 });
  }
}
