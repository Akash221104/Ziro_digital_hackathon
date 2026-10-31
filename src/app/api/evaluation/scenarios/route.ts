// src/app/api/evaluation/scenarios/route.ts
import { NextResponse } from "next/server";
import { runEvaluationScenarios } from "@/server/evaluation/scenarios";

export async function GET() {
  try {
    const report = runEvaluationScenarios();
    return NextResponse.json(report, { status: 200 });
  } catch (err: any) {
    console.error("Scenarios suite error:", err);
    return NextResponse.json({ error: err.message || "Failed to run scenario suite" }, { status: 500 });
  }
}

