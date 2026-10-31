// src/server/agent/agent.ts
import { NegotiationState, ToolCall } from "@/types/negotiation";
import { callOpenRouter } from "./llm";
import { systemPrompt } from "./prompt";
import { z } from "zod";
import { executeTool } from "../tools";

// Structured response schema from the LLM
const AgentResponseSchema = z.object({
  action: z.enum([
    "ASK_QUESTION",
    "MAKE_COUNTER_OFFER",
    "HOLD_POSITION",
    "REJECT_REQUEST",
    "END_NEGOTIATION",
    "USE_TOOL",
    "REQUEST_HUMAN_APPROVAL",
  ]),
  payload: z.any().optional(),
  message: z.string(),
  counterOffer: z.number().optional(),
  approvalReason: z.string().optional(),
});

export type AgentDecision = z.infer<typeof AgentResponseSchema>;

/**
 * Strips any leaked JSON, thinking tags, or raw object syntax from spoken text.
 * Guarantees that candidates NEVER see or hear `{ "thought": ... }` or raw JSON.
 */
export function cleanSpokenMessage(text: string): string {
  if (!text) return "";

  let cleaned = text.trim();

  // If text starts with conversational preamble followed by JSON:
  // e.g. "Google's offer is strong... { "thought": "...", "message": "..." }"
  const jsonIndex = cleaned.search(/\{[\s\S]*\}/);
  if (jsonIndex > 0) {
    const preamble = cleaned.substring(0, jsonIndex).trim();
    if (preamble.length >= 10) {
      return preamble;
    }
  }

  // Remove any JSON code blocks
  cleaned = cleaned.replace(/```(?:json)?[\s\S]*?```/gi, "");

  // Remove any standalone JSON blocks { ... }
  cleaned = cleaned.replace(/\{[\s\S]*?\}/g, "");

  // Remove stray JSON keys if they appear outside braces
  cleaned = cleaned.replace(/"thought"\s*:\s*"[^"]*"/gi, "");
  cleaned = cleaned.replace(/"action"\s*:\s*"[^"]*"/gi, "");
  cleaned = cleaned.replace(/"message"\s*:\s*"[^"]*"/gi, "");
  cleaned = cleaned.replace(/"counterOffer"\s*:\s*\d+/gi, "");

  // Remove stray curly braces or unescaped quotes at borders
  cleaned = cleaned.replace(/^[\s{}"':,]+|[\s{}"':,]+$/g, "").trim();

  return cleaned || "Could you please elaborate on your expectation?";
}

/**
 * Extracts and sanitizes an AgentDecision from raw LLM output,
 * handling malformed outputs, preambles, and code fences.
 */
function extractCleanDecision(rawResponse: string): AgentDecision {
  const trimmed = (rawResponse || "").trim();

  // Try 1: Markdown JSON fence ```json ... ```
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlock) {
    try {
      const parsed = JSON.parse(codeBlock[1]);
      if (parsed && typeof parsed === "object") {
        return sanitizeParsedObject(parsed, trimmed);
      }
    } catch {}
  }

  // Try 2: Outermost curly braces { ... }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const jsonStr = trimmed.substring(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === "object") {
        // If there was conversational text before the brace, check if we should prefer preamble
        const preamble = trimmed.substring(0, firstBrace).trim();
        return sanitizeParsedObject(parsed, preamble || trimmed);
      }
    } catch {}
  }

  // Try 3: Direct parse
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object") {
      return sanitizeParsedObject(parsed, trimmed);
    }
  } catch {}

  // Fallback: Non-JSON raw text
  return {
    action: "ASK_QUESTION",
    message: cleanSpokenMessage(trimmed),
  };
}

function sanitizeParsedObject(parsed: any, fallbackText: string): AgentDecision {
  const validActions = [
    "ASK_QUESTION",
    "MAKE_COUNTER_OFFER",
    "HOLD_POSITION",
    "REJECT_REQUEST",
    "END_NEGOTIATION",
    "USE_TOOL",
    "REQUEST_HUMAN_APPROVAL",
  ];

  const action = validActions.includes(parsed.action)
    ? parsed.action
    : "ASK_QUESTION";

  let rawMessage = "";
  if (typeof parsed.message === "string" && parsed.message.trim()) {
    rawMessage = parsed.message;
  } else if (typeof fallbackText === "string" && fallbackText.trim()) {
    rawMessage = fallbackText;
  }

  const message = cleanSpokenMessage(rawMessage);

  return {
    action,
    message,
    payload: parsed.payload,
    counterOffer: typeof parsed.counterOffer === "number" ? parsed.counterOffer : undefined,
    approvalReason: typeof parsed.approvalReason === "string" ? parsed.approvalReason : undefined,
  };
}

/**
 * Run the negotiation agent using current negotiation state and latest candidate message.
 * Returns a validated and privacy-sanitized AgentDecision.
 */
export async function runNegotiationAgent(
  state: NegotiationState,
  candidateMessage: string
): Promise<AgentDecision> {
  const MAX_TOOL_CALLS = 3;
  let remainingCalls = MAX_TOOL_CALLS;

  // Helper to build LLM messages from current state
  const buildMessages = (extraMessage?: { role: string; content: string }) => {
    const msgs: { role: string; content: string }[] = [];

    const dynamicContext = `${systemPrompt}

CURRENT NEGOTIATION CONTEXT:
- Candidate Name: ${state.candidate?.name || "Candidate"}
- Role: ${state.role || "Software Engineer"}
- Current Base Offer: ₹${(state.currentOffer || 0).toLocaleString("en-IN")}
- Candidate Stated Demand: ${state.candidateDemand ? `₹${state.candidateDemand.toLocaleString("en-IN")}` : "Exploring expectations"}
- Current Round: ${state.round || 1}
- Interview Scores: ${JSON.stringify(state.candidate?.interviewScores || [])}

NEGOTIATOR DIRECTIVE:
1. React actively to any company name (Google, Amazon, etc.) or salary figure mentioned.
2. Probe if competing packages are fixed base vs variable bonus/RSUs.
3. Keep spoken replies to 1-2 punchy sentences (<30 words) ending with a clear counter-question or counter-offer.`;

    msgs.push({ role: "system", content: dynamicContext });
    for (const ev of state.history) {
      const role = ev.speaker === "candidate" ? "user" : "assistant";
      msgs.push({ role, content: ev.message });
    }
    if (candidateMessage) {
      msgs.push({ role: "user", content: candidateMessage });
    }
    if (extraMessage) {
      msgs.push(extraMessage);
    }
    return msgs;
  };

  let messages = buildMessages();
  while (true) {
    const rawResponse = await callOpenRouter(messages);
    const decision = extractCleanDecision(rawResponse);

    if (decision.action !== "USE_TOOL") {
      return decision;
    }

    // Handle tool usage
    if (remainingCalls <= 0) {
      return {
        action: "ASK_QUESTION",
        message: "Could you share more details on your expectations?",
      };
    }

    const { toolName, args } = decision.payload || {};
    const toolCall: ToolCall = { toolName, args };
    const toolResult = await executeTool(toolCall);

    // Record tool call
    state.toolCalls.push({ ...toolCall, result: toolResult });

    // Add a history event summarizing the tool result for the LLM
    const summaryMsg = `Tool ${toolName} executed. ${toolResult.summary}`;
    state.history.push({ speaker: "agent", message: summaryMsg, timestamp: new Date().toISOString() });

    // Rebuild messages including the new tool result as assistant message
    messages = buildMessages({ role: "assistant", content: summaryMsg });
    remainingCalls--;
  }
}
