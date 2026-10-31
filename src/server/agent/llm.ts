// src/server/agent/llm.ts
import { env } from "@/utils/env";

/**
 * Call low-latency LLM with prompt and context.
 * Prioritizes high-speed inference for conversational voice latency.
 */
export async function callOpenRouter(messages: { role: string; content: string }[]): Promise<string> {
  // If Groq is configured, use it for ultra-low latency (~200ms response time)
  if (env.GROQ_API_KEY) {
    try {
      return await callGroq(messages);
    } catch (err) {
      console.warn("Groq call failed, falling back to OpenRouter:", err);
    }
  }

  const url = "https://openrouter.ai/api/v1/chat/completions";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
  };

  const body = {
    model: "meta-llama/llama-3.3-70b-instruct",
    messages,
    max_tokens: 160,
    temperature: 0.2,
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenRouter request failed: ${res.status} ${txt}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

/**
 * High-speed Groq LLM inference (~250 tokens/sec).
 */
async function callGroq(messages: { role: string; content: string }[]): Promise<string> {
  const url = "https://api.groq.com/openai/v1/chat/completions";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.GROQ_API_KEY}`,
  };

  const body = {
    model: "llama-3.3-70b-versatile",
    messages,
    max_tokens: 160,
    temperature: 0.2,
    response_format: { type: "json_object" },
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Groq request failed: ${res.status} ${txt}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}
