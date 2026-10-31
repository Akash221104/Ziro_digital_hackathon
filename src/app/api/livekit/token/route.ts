// src/app/api/livekit/token/route.ts
import { NextResponse, NextRequest } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { store } from "@/server/store";
import { env } from "@/utils/env";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const negotiationId = searchParams.get("negotiationId");
  const participantType = searchParams.get("type") || "candidate";

  if (!negotiationId) {
    return NextResponse.json({ error: "negotiationId is required" }, { status: 400 });
  }

  const state = store.get(negotiationId);
  if (!state) {
    return NextResponse.json({ error: "Negotiation not found" }, { status: 404 });
  }

  const roomName = `negotiation-${negotiationId}`;
  const identity = participantType === "agent"
    ? `ai-hr-${negotiationId}`
    : `candidate-${negotiationId}`;

  try {
    const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
      identity,
      name: participantType === "agent" ? "AutoOffer AI HR" : (state.candidate?.name || "Candidate"),
      ttl: "2h",
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      token,
      url: env.LIVEKIT_URL,
      room: roomName,
      identity,
    });
  } catch (err: any) {
    console.error("LiveKit token generation failed:", err);
    return NextResponse.json({ error: "Failed to generate LiveKit token" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { negotiationId, type } = body || {};

    if (!negotiationId) {
      return NextResponse.json({ error: "negotiationId is required" }, { status: 400 });
    }

    const state = store.get(negotiationId);
    if (!state) {
      return NextResponse.json({ error: "Negotiation not found" }, { status: 404 });
    }

    const roomName = `negotiation-${negotiationId}`;
    const identity = type === "agent" ? `ai-hr-${negotiationId}` : `candidate-${negotiationId}`;

    const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
      identity,
      name: type === "agent" ? "AutoOffer AI HR" : (state.candidate?.name || "Candidate"),
      ttl: "2h",
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      token,
      url: env.LIVEKIT_URL,
      room: roomName,
      identity,
    });
  } catch (err: any) {
    console.error("LiveKit token generation failed:", err);
    return NextResponse.json({ error: "Failed to generate LiveKit token" }, { status: 500 });
  }
}

