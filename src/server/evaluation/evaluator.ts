// src/server/evaluation/evaluator.ts
import { NegotiationState } from "@/types/negotiation";
import {
  EvaluationResult,
  EvaluationResultSchema,
  ReplayEvent,
  ReplayEventType,
} from "./types";

function parseSalaryFromText(text: string): number | null {
  const rangeMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:to|-)\s*(\d+(?:\.\d+)?)(?:\s*(?:lpa|lakh|lac|l))?/i);
  if (rangeMatch) {
    const highVal = parseFloat(rangeMatch[2]);
    if (highVal > 0 && highVal < 150) return Math.round(highVal * 100000);
  }
  const lpaMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lpa|lakh|lac|l)\b/i);
  if (lpaMatch) {
    const val = parseFloat(lpaMatch[1]);
    return Math.round(val * 100000);
  }
  const rawMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{2,3})+|\d{5,8})/i);
  if (rawMatch) {
    const cleaned = rawMatch[1].replace(/,/g, "");
    const val = parseInt(cleaned, 10);
    if (!isNaN(val) && val > 100000) return val;
  }
  const shortNumMatch = text.match(/\b([5-9]|[1-9]\d)\b/);
  if (shortNumMatch) {
    const val = parseFloat(shortNumMatch[1]);
    if (val >= 6 && val <= 120) return Math.round(val * 100000);
  }
  return null;
}

/**
 * Deterministic and observable negotiation evaluation engine.
 * Never exposes hidden HR information to the candidate.
 */
export function evaluateNegotiation(state: NegotiationState): EvaluationResult {
  const history = state.history || [];
  const candidateMessages = history.filter((h) => h.speaker === "candidate");
  const agentMessages = history.filter((h) => h.speaker === "agent");
  const combinedCandidateText = candidateMessages.map((m) => m.message.toLowerCase()).join(" ");

  const initialOffer = state.history.find((h) => h.speaker === "agent")
    ? (Number(state.history[0]?.message.match(/\d[\d,]*/)?.[0]?.replace(/,/g, "")) || state.currentOffer)
    : state.currentOffer;

  const hiddenMaximum = state.hrPrivate?.maxBudget || (initialOffer * 1.3);
  let candidateInitialDemand = state.candidateDemand || 0;
  if (!candidateInitialDemand) {
    for (const m of candidateMessages) {
      const parsed = parseSalaryFromText(m.message);
      if (parsed) {
        candidateInitialDemand = parsed;
        break;
      }
    }
  }
  const finalOffer = state.currentOffer || initialOffer;

  // 1. Anchoring (Max: 20)
  let anchoringScore = 12;
  let anchoringReason = "Candidate established a standard baseline ask.";
  if (candidateInitialDemand > 0) {
    const anchorRatio = candidateInitialDemand / initialOffer;
    if (anchorRatio >= 1.15 && anchorRatio <= 1.4) {
      anchoringScore = 18;
      anchoringReason = `Established a well-calibrated opening anchor of ₹${candidateInitialDemand.toLocaleString("en-IN")}, demonstrating strong commercial confidence without exceeding reasonable market boundaries.`;
    } else if (anchorRatio > 1.4) {
      anchoringScore = 14;
      anchoringReason = `Opened with an aggressive anchor of ₹${candidateInitialDemand.toLocaleString("en-IN")}, exceeding standard range and prompting firm boundary maintenance from HR.`;
    } else {
      anchoringScore = 13;
      anchoringReason = "Opening anchor was modest relative to role benchmarks, leaving limited negotiation headroom.";
    }
  } else if (candidateMessages.length === 0) {
    anchoringScore = 8;
    anchoringReason = "Candidate did not articulate an initial anchor or expectation.";
  }

  // 2. Justification (Max: 20)
  let justificationScore = 10;
  let justificationReason = "Basic verbal rationale provided without in-depth metrics.";
  const justificationKeywords = [
    "experience",
    "architecture",
    "scale",
    "lead",
    "project",
    "score",
    "technical",
    "delivered",
    "impact",
    "revenue",
    "performance",
  ];
  const matchedJustifications = justificationKeywords.filter((k) => combinedCandidateText.includes(k));
  if (matchedJustifications.length >= 4) {
    justificationScore = 19;
    justificationReason = "Exceptional justification citing concrete technical impact, previous interview ratings, and domain leadership depth.";
  } else if (matchedJustifications.length >= 2) {
    justificationScore = 16;
    justificationReason = "Solid justification highlighting core responsibilities and interview performance.";
  } else {
    justificationScore = 11;
    justificationReason = "Limited evidence provided; demands were stated primarily as personal expectations rather than capability-backed value.";
  }

  // 3. Market Awareness (Max: 15)
  let marketScore = 9;
  let marketReason = "Standard market expectations inferred.";
  const marketKeywords = ["market", "benchmark", "industry", "standard", "range", "tier", "average", "median"];
  const matchedMarket = marketKeywords.filter((k) => combinedCandidateText.includes(k));
  if (matchedMarket.length >= 2) {
    marketScore = 14;
    marketReason = "Demonstrated clear command of current market percentiles and compensation bands for comparable seniority.";
  } else if (matchedMarket.length === 1) {
    marketScore = 12;
    marketReason = "Referenced market compensation awareness during exchange.";
  } else {
    marketScore = 9;
    marketReason = "Did not actively leverage independent salary benchmarks during discussions.";
  }

  // 4. Leverage (Max: 20)
  let leverageScore = 10;
  let leverageReason = "Relied strictly on internal qualifications.";
  const leverageKeywords = [
    "competing",
    "another offer",
    "other offer",
    "other company",
    "holding offer",
    "offer from",
    "offer of",
    "google",
    "goolge",
    "microsoft",
    "amazon",
    "meta",
    "flipkart",
    "uber",
    "counter",
    "retention",
    "notice",
    "in hand",
  ];
  const hasCompetingOffer = leverageKeywords.some((k) => combinedCandidateText.includes(k));
  if (hasCompetingOffer) {
    leverageScore = 18;
    leverageReason = "Skillfully introduced an external competing alternative, creating strong urgency without adopting an ultimatum posture.";
  } else if (matchedJustifications.length >= 3) {
    leverageScore = 14;
    leverageReason = "Utilized high interview test evaluations as primary internal leverage.";
  } else {
    leverageScore = 11;
    leverageReason = "Did not establish credible external alternatives or competitive leverage.";
  }

  // 5. Timing (Max: 10)
  let timingScore = 7;
  let timingReason = "Paced discussions across negotiation turns.";
  const rounds = state.round || candidateMessages.length;
  if (rounds >= 3 && rounds <= 6) {
    timingScore = 9;
    timingReason = "Demonstrated effective patience, pacing counter-arguments across multiple rounds without premature concessions.";
  } else if (rounds > 6) {
    timingScore = 7;
    timingReason = "Extended discussion across many rounds, risking stalled consensus.";
  } else if (rounds === 1) {
    timingScore = 5;
    timingReason = "Conceded or finalized position very early in the dialogue.";
  } else {
    timingScore = 8;
    timingReason = "Balanced response cadence maintained throughout the dialogue.";
  }

  // 6. Final Outcome (Max: 15)
  let outcomeScore = 10;
  let outcomeReason = "Reached mutual agreement.";
  const maximumAchievedPercent = Math.min(
    100,
    Math.round(((finalOffer / (hiddenMaximum || 1)) * 100) * 10) / 10
  );

  if (maximumAchievedPercent >= 92) {
    outcomeScore = 15;
    outcomeReason = `Maximized outcome capturing ${maximumAchievedPercent}% of available ceiling while maintaining company alignment.`;
  } else if (maximumAchievedPercent >= 82) {
    outcomeScore = 13;
    outcomeReason = `Secured solid compensation at ${maximumAchievedPercent}% of budget parameter.`;
  } else {
    outcomeScore = 10;
    outcomeReason = `Settled within baseline offer parameters (${maximumAchievedPercent}% of ceiling).`;
  }

  const overallScore = Math.min(
    100,
    anchoringScore + justificationScore + marketScore + leverageScore + timingScore + outcomeScore
  );

  // Derive Strengths and Weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (anchoringScore >= 16) strengths.push("Established strong, assertive opening anchor that defined positive negotiation range.");
  else weaknesses.push("Opening anchor was passive, missing an opportunity to define a higher reference point.");

  if (justificationScore >= 15) strengths.push("Articulated specific technical achievements and past performance to back compensation expectations.");
  else weaknesses.push("Relied on aspirational salary expectations rather than quantifiable past metrics.");

  if (leverageScore >= 15) strengths.push("Introduced credible market leverage and external options with professional diplomacy.");
  else weaknesses.push("Did not introduce external market leverage or competing timeline considerations.");

  if (timingScore >= 8) strengths.push("Paced concessions deliberatively, avoiding hasty concessions across multiple dialogue rounds.");
  else weaknesses.push("Conceded position too quickly without extracting reciprocal non-cash considerations.");

  // Build Key Moments / Replay V1 Timeline (5 to 10 events)
  const keyMoments: ReplayEvent[] = [];

  // Moment 1: Initial Anchor / Offer
  keyMoments.push({
    id: "km-1",
    timestamp: "00:30",
    type: "INITIAL_ANCHOR",
    title: "Initial Offer & Opening Anchor",
    candidateStatement: candidateMessages[0]?.message || `I am targeting ₹${(candidateInitialDemand || initialOffer * 1.2).toLocaleString("en-IN")}.`,
    aiResponse: agentMessages[0]?.message || `Welcome! Our starting formal offer is ₹${initialOffer.toLocaleString("en-IN")}.`,
    hrExplanation: "The session opened with baseline compensation proposal and candidate initial demand calibration.",
  });

  // Moment 2: Competing offer / Leverage or Justification
  let momentIdx = 2;
  for (let i = 1; i < history.length; i++) {
    const item = history[i];
    if (item.speaker === "candidate") {
      const text = item.message.toLowerCase();
      let type: ReplayEventType = "JUSTIFICATION";
      let title = "Candidate Value Justification";
      let explanation = "Candidate presented reasoning regarding past experience and technical depth.";

      if (
        text.includes("competing") ||
        text.includes("other offer") ||
        text.includes("another offer") ||
        text.includes("counter") ||
        text.includes("google") ||
        text.includes("goolge") ||
        text.includes("amazon") ||
        text.includes("microsoft")
      ) {
        type = "COMPETING_OFFER";
        title = "Competing Market Offer Introduced";
        explanation = "Candidate highlighted an external competing offer to establish commercial leverage.";
      } else if (text.includes("accept") || text.includes("agree") || text.includes("meet halfway") || text.includes("can do")) {
        type = "CANDIDATE_CONCESSION";
        title = "Candidate Position Adjustment";
        explanation = "Candidate demonstrated flexibility by converging towards mutual agreement.";
      }

      const nextAgent = history.slice(i + 1).find((h) => h.speaker === "agent");

      keyMoments.push({
        id: `km-${momentIdx++}`,
        timestamp: `0${Math.min(9, momentIdx * 2)}:${15 + (momentIdx * 5)}`,
        type,
        title,
        candidateStatement: item.message,
        aiResponse: nextAgent?.message || "I appreciate you sharing those details.",
        hrExplanation: explanation,
      });

      if (keyMoments.length >= 7) break;
    }
  }

  // Add Tool Usage moment if any tool was executed
  if (state.toolCalls && state.toolCalls.length > 0) {
    const tc = state.toolCalls[0];
    keyMoments.push({
      id: `km-${momentIdx++}`,
      timestamp: "05:10",
      type: "TOOL_USAGE",
      title: `Agent Tool Verification: ${tc.toolName}`,
      aiResponse: `Market benchmarking data evaluated for role ${state.role || "position"}.`,
      hrExplanation: `AI Agent executed deterministic ${tc.toolName} to validate internal offer parity.`,
    });
  }

  // Add Human Approval moment if present
  if (state.humanApproval?.status && state.humanApproval.status !== "NOT_REQUIRED") {
    keyMoments.push({
      id: `km-${momentIdx++}`,
      timestamp: "06:45",
      type: "HUMAN_APPROVAL",
      title: `HR Governance Checkpoint (${state.humanApproval.status})`,
      aiResponse: "Offer paused pending human executive sign-off.",
      hrExplanation: `Human approval was engaged with status: ${state.humanApproval.status}. ${state.humanApproval.reviewerNote ? `Reviewer: "${state.humanApproval.reviewerNote}"` : ""}`,
    });
  }

  // Moment Final: Conclusion
  keyMoments.push({
    id: `km-${momentIdx}`,
    timestamp: "08:20",
    type: "FINAL_OFFER",
    title: "Final Compensation Consensus",
    candidateStatement: "Thank you, this reflects a mutually respectful package.",
    aiResponse: `We are delighted to confirm the finalized offer of ₹${finalOffer.toLocaleString("en-IN")}.`,
    hrExplanation: `Negotiation concluded successfully with final package finalized at ₹${finalOffer.toLocaleString("en-IN")} (${maximumAchievedPercent}% of max budget).`,
  });

  const rawResult = {
    overallScore,
    dimensions: {
      anchoring: { score: anchoringScore, max: 20, reason: anchoringReason },
      justification: { score: justificationScore, max: 20, reason: justificationReason },
      marketAwareness: { score: marketScore, max: 15, reason: marketReason },
      leverage: { score: leverageScore, max: 20, reason: leverageReason },
      timing: { score: timingScore, max: 10, reason: timingReason },
      finalOutcome: { score: outcomeScore, max: 15, reason: outcomeReason },
    },
    salaryMetrics: {
      initialOffer,
      candidateInitialAsk: candidateInitialDemand > 0 ? candidateInitialDemand : undefined,
      finalOffer,
      hiddenMaximum,
      maximumAchievedPercent,
    },
    strengths,
    weaknesses,
    keyMoments: keyMoments.slice(0, 9),
  };

  return EvaluationResultSchema.parse(rawResult);
}

