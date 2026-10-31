// src/utils/env.ts
import { z } from "zod";

/**
 * Environment variables validation. Only server‑side variables are validated here.
 * Client‑side vars (prefixed with NEXT_PUBLIC_) are accessed directly where needed.
 */
const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1),
  GROQ_API_KEY: z.string().min(1).optional(),
  LIVEKIT_API_KEY: z.string().min(1),
  LIVEKIT_API_SECRET: z.string().min(1),
  LIVEKIT_URL: z.string().url(),
  NEXT_PUBLIC_LIVEKIT_URL: z.string().url(),
  VERBX_API_KEY: z.string().min(1),
});

/**
 * Throws if required env vars are missing. In development this will surface early.
 */
export const env = envSchema.parse(process.env);
