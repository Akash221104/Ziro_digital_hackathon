// src/server/tools/calculateCompensation.ts
import { ToolResult, CompensationInput } from "./types";

/** Simple compensation calculation tool */
export function calculateCompensation(input: CompensationInput): ToolResult<{ totalCompensation: number; currency: string }> {
  const { baseSalary, bonus = 0, joiningBonus = 0, currentOffer } = input;
  const totalCompensation = baseSalary + bonus + joiningBonus;
  const improvement = totalCompensation - currentOffer;
  const summary = improvement > 0
    ? `Proposed compensation ₹${(totalCompensation / 100000).toFixed(1)}L exceeds current offer by ₹${(improvement / 100000).toFixed(1)}L.`
    : `Proposed compensation ₹${(totalCompensation / 100000).toFixed(1)}L is below current offer by ₹${((-improvement) / 100000).toFixed(1)}L.`;
  return {
    success: true,
    tool: "calculateCompensation",
    data: { totalCompensation, currency: "INR" },
    summary,
  };
}
