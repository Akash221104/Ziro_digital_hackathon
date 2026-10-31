// src/app/api/verbx/stt/route.ts
import { NextResponse, NextRequest } from "next/server";
import { env } from "@/utils/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const audio_base64 = body?.audio_base64;

    if (!audio_base64) {
      return NextResponse.json({ error: "audio_base64 is required" }, { status: 400 });
    }

    const response = await fetch("https://api.verbxeco.com/v1/stt", {
      method: "POST",
      headers: {
        "x-api-key": env.VERBX_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audio_base64 }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: errText, fallback: true }, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json({ text: data?.text || "", model: data?.model || "verbx-vocaline" }, { status: 200 });
  } catch (err: any) {
    console.warn("VerbX STT proxy error:", err);
    return NextResponse.json({ error: err.message, fallback: true }, { status: 200 });
  }
}

