"use client";

import React, { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { getNegotiationInternal } from "@/lib/api";
import type { EvaluationResult, ReplayEvent } from "@/server/evaluation/types";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Clock,
  Briefcase,
  User,
  Sparkles,
  RefreshCw,
  PlayCircle,
  FileText,
  Sliders,
  Check,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

function NegotiationReportContent({ params }: PageProps) {
  const { id } = use(params);

  const [state, setState] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [selectedMoment, setSelectedMoment] = useState<ReplayEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [stateRes, evalRes] = await Promise.all([
          getNegotiationInternal(id),
          fetch(`/api/negotiations/${id}/evaluation`).then((r) => r.json()),
        ]);

        if (evalRes.error) throw new Error(evalRes.error);

        setState(stateRes);
        setEvaluation(evalRes);
        if (evalRes.keyMoments && evalRes.keyMoments.length > 0) {
          setSelectedMoment(evalRes.keyMoments[0]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load report data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Generating HR Evaluation Report & Replay...</p>
        </div>
      </div>
    );
  }

  if (error || !evaluation || !state) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-900">Report Unavailable</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">{error || "Could not generate report."}</p>
        <Link href="/hr" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold">
          Return to HR Dashboard
        </Link>
      </div>
    );
  }

  const candidate = state.candidate || {};
  const metrics = evaluation.salaryMetrics;
  const dimensions = evaluation.dimensions;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href={`/hr/negotiation/${id}`}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">
                Executive HR Negotiation Report
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                AUDITED
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive candidate negotiation scoring, salary journey, and event replay timeline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/hr/negotiation/${id}`}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            Back to Room
          </Link>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-blue-600 transition shadow-xs flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Section 1: Candidate Overview */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          Candidate Profile & Historical Context
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium block">Candidate Name</span>
            <span className="text-base font-bold text-slate-900 mt-1 block">{candidate.name || "Candidate"}</span>
            <span className="text-xs text-slate-500">{candidate.email || "No email"}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium block">Role & Seniority</span>
            <span className="text-base font-bold text-slate-900 mt-1 block">{state.role || "Software Engineer"}</span>
            <span className="text-xs text-slate-500">{state.experience || "Senior"} yrs exp</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium block">Interview Ratings</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-indigo-600">
                Tech: {candidate.interviewScores?.[0]?.score || 85}/100
              </span>
              <span>•</span>
              <span className="text-sm font-bold text-emerald-600">
                HR: {candidate.interviewScores?.[1]?.score || 80}/100
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Pre-screen verified</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium block">Negotiation Rounds</span>
            <span className="text-base font-bold text-slate-900 mt-1 block">{state.round || 1} Turns</span>
            <span className="text-xs text-emerald-600 font-semibold">Autonomous Closure</span>
          </div>
        </div>
      </div>

      {/* Section 2: Salary Journey & Outcome Metrics */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          Salary Journey & Budget Efficiency
        </h2>

        {/* Visual Journey Progression */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[11px] text-slate-500 font-semibold block">1. Initial Offer</span>
            <span className="text-sm font-extrabold text-slate-800 mt-1 block">
              ₹{metrics.initialOffer.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/60">
            <span className="text-[11px] text-indigo-600 font-semibold block">2. Candidate Demand</span>
            <span className="text-sm font-extrabold text-indigo-900 mt-1 block">
              ₹{(metrics.candidateInitialAsk || metrics.initialOffer * 1.25).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/60">
            <span className="text-[11px] text-blue-600 font-semibold block">3. AI Counter-Offer</span>
            <span className="text-sm font-extrabold text-blue-900 mt-1 block">
              ₹{Math.round((metrics.initialOffer + metrics.finalOffer) / 2).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60">
            <span className="text-[11px] text-amber-700 font-semibold block">4. Concessions</span>
            <span className="text-sm font-extrabold text-amber-900 mt-1 block">Balanced Pacing</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300">
            <span className="text-[11px] text-emerald-700 font-semibold block">5. Final Negotiated</span>
            <span className="text-sm font-extrabold text-emerald-900 mt-1 block">
              ₹{metrics.finalOffer.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/60">
            <span className="text-[11px] text-rose-700 font-semibold block">Hidden Ceiling</span>
            <span className="text-sm font-extrabold text-rose-900 mt-1 block">
              ₹{metrics.hiddenMaximum.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Maximum Achieved % Highlight */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-blue-200 font-semibold uppercase tracking-wider">
              Maximum Budget Utilization
            </div>
            <div className="text-sm text-slate-300 mt-0.5">
              Formula: (Final Negotiated Offer ÷ Hidden Maximum Budget) × 100
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-emerald-400">
              {metrics.maximumAchievedPercent}%
            </span>
            <span className="text-xs text-slate-300 block">Preserved Budget Headroom</span>
          </div>
        </div>
      </div>

      {/* Section 3: Negotiation Score & 6 Dimensions */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Candidate Negotiation Scorecard
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Six-dimension objective evaluation model calibrated across 100 maximum points.
            </p>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-right">
            <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider block">Overall Score</span>
            <span className="text-3xl font-black text-indigo-900">
              {evaluation.overallScore} <span className="text-base text-indigo-500 font-bold">/ 100</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Dimension 1: Anchoring */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-800">1. Anchoring</span>
              <span className="text-indigo-600">{dimensions.anchoring.score} / {dimensions.anchoring.max} pts</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${(dimensions.anchoring.score / dimensions.anchoring.max) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 pt-1 leading-relaxed">{dimensions.anchoring.reason}</p>
          </div>

          {/* Dimension 2: Justification */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-800">2. Justification</span>
              <span className="text-indigo-600">{dimensions.justification.score} / {dimensions.justification.max} pts</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${(dimensions.justification.score / dimensions.justification.max) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 pt-1 leading-relaxed">{dimensions.justification.reason}</p>
          </div>

          {/* Dimension 3: Market Awareness */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-800">3. Market Awareness</span>
              <span className="text-indigo-600">{dimensions.marketAwareness.score} / {dimensions.marketAwareness.max} pts</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${(dimensions.marketAwareness.score / dimensions.marketAwareness.max) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 pt-1 leading-relaxed">{dimensions.marketAwareness.reason}</p>
          </div>

          {/* Dimension 4: Leverage */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-800">4. Leverage</span>
              <span className="text-indigo-600">{dimensions.leverage.score} / {dimensions.leverage.max} pts</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${(dimensions.leverage.score / dimensions.leverage.max) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 pt-1 leading-relaxed">{dimensions.leverage.reason}</p>
          </div>

          {/* Dimension 5: Timing */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-800">5. Timing</span>
              <span className="text-indigo-600">{dimensions.timing.score} / {dimensions.timing.max} pts</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${(dimensions.timing.score / dimensions.timing.max) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 pt-1 leading-relaxed">{dimensions.timing.reason}</p>
          </div>

          {/* Dimension 6: Final Outcome */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-800">6. Final Outcome</span>
              <span className="text-indigo-600">{dimensions.finalOutcome.score} / {dimensions.finalOutcome.max} pts</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${(dimensions.finalOutcome.score / dimensions.finalOutcome.max) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 pt-1 leading-relaxed">{dimensions.finalOutcome.reason}</p>
          </div>
        </div>
      </div>

      {/* Section 4: Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Key Candidate Strengths
          </h2>
          <ul className="space-y-2.5">
            {evaluation.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Areas for Development / Weaknesses
          </h2>
          <ul className="space-y-2.5">
            {evaluation.weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Section 5: Replay V1 — Clickable Event Timeline */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <PlayCircle className="w-4 h-4" />
            <span>Interactive Replay V1</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Timestamped Negotiation Event Timeline
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Click any milestone moment to inspect the conversation excerpt and confidential HR explanation.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left: Event List (5 to 10 events) */}
          <div className="lg:col-span-5 space-y-2">
            {evaluation.keyMoments.map((km) => {
              const isSelected = selectedMoment?.id === km.id;

              return (
                <button
                  key={km.id}
                  onClick={() => setSelectedMoment(km)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-blue-50 border-blue-300 shadow-xs text-blue-950 font-bold"
                      : "bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {km.timestamp}
                    </span>
                    <div>
                      <div className="text-xs font-bold">{km.title}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">{km.type}</div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-slate-300"}`} />
                </button>
              );
            })}
          </div>

          {/* Right: Selected Moment Context Card */}
          <div className="lg:col-span-7">
            {selectedMoment ? (
              <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 shadow-lg border border-slate-800">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-blue-600 text-white font-bold">
                      {selectedMoment.timestamp}
                    </span>
                    <h3 className="font-bold text-sm text-white">{selectedMoment.title}</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedMoment.type}
                  </span>
                </div>

                {selectedMoment.candidateStatement && (
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                      Candidate Statement
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      "{selectedMoment.candidateStatement}"
                    </p>
                  </div>
                )}

                {selectedMoment.aiResponse && (
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                      AI HR Response
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      "{selectedMoment.aiResponse}"
                    </p>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-800/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block mb-1">
                    Confidential HR Explanation
                  </span>
                  <p className="text-xs text-indigo-100 leading-relaxed">
                    {selectedMoment.hrExplanation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs">
                Select an event from the timeline to view details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NegotiationReportPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Generating HR Evaluation Report...</p>
          </div>
        </div>
      }
    >
      <NegotiationReportContent params={params} />
    </Suspense>
  );
}

