// src/app/api/verbx/tts/route.ts
import { NextResponse, NextRequest } from "next/server";
import { env } from "@/utils/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = body?.text;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    // Call real VerbX TTS endpoint
    const response = await fetch("https://api.verbxeco.com/v1/tts", {
      method: "POST",
      headers: {
        "x-api-key": env.VERBX_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("VerbX TTS non-OK response:", response.status, errText);
      return NextResponse.json({ fallback: true, error: errText }, { status: 200 });
    }

    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") || "audio/ogg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.warn("VerbX TTS proxy error:", err);
    return NextResponse.json({ fallback: true, error: err.message }, { status: 200 });
  }
}

