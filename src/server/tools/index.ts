// src/server/tools/index.ts
import { ToolCall } from "@/types/negotiation";
import { ToolResult } from "./types";
import { getSalaryBenchmark } from "./salaryBenchmark";
import { calculateCompensation } from "./calculateCompensation";
import { analyzeCandidateSignal } from "./analyzeCandidateSignal";

/** Registry of available tool functions */
const toolMap: Record<string, (args: any) => ToolResult<any>> = {
  getSalaryBenchmark,
  calculateCompensation,
  analyzeCandidateSignal,
};

/** Execute a tool based on the provided ToolCall */
export async function executeTool(call: ToolCall): Promise<ToolResult<any>> {
  const fn = toolMap[call.toolName];
  if (!fn) {
    return {
      success: false,
      tool: call.toolName,
      data: null,
      summary: `Tool ${call.toolName} is not recognized.`,
    };
  }
  try {
    // Assume synchronous implementation; wrap in Promise for uniformity
    const result = fn(call.args);
    return Promise.resolve(result);
  } catch (err: any) {
    return {
      success: false,
      tool: call.toolName,
      data: null,
      summary: `Error executing ${call.toolName}: ${err.message}`,
    };
  }
}
