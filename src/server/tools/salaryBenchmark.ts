// src/server/tools/salaryBenchmark.ts
import { ToolResult, SalaryBenchmarkInput } from "./types";

/** Deterministic internal salary benchmark dataset */
export function getSalaryBenchmark(input: SalaryBenchmarkInput): ToolResult<{ low: number; median: number; high: number; currency: string }> {
  const { role, experience, location } = input;

  // Base salary (annual INR) for demonstration purposes
  let base = 600000; // fresher default
  const exp = experience.toLowerCase();
  if (exp.includes("senior")) base = 1500000;
  else if (exp.includes("mid")) base = 1000000;

  // Location multiplier (simple heuristic)
  const locFactor = location.toLowerCase().includes("india") ? 1 : 1.2;

  const low = Math.round(base * 0.9 * locFactor);
  const median = Math.round(base * locFactor);
  const high = Math.round(base * 1.2 * locFactor);

  return {
    success: true,
    tool: "getSalaryBenchmark",
    data: { low, median, high, currency: "INR" },
    summary: `Estimated market range for a ${experience} ${role} in ${location} is ₹${(low / 100000).toFixed(1)}L–₹${(high / 100000).toFixed(1)}L with a median around ₹${(median / 100000).toFixed(1)}L.`,
  };
}
