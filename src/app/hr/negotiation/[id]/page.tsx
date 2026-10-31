"use client";

import React, { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { getNegotiationInternal, submitApproval, postMessage } from "@/lib/api";
import {
  ShieldAlert,
  ArrowLeft,
  Bot,
  User,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  Send,
  Lock,
  DollarSign,
  Award,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

function NegotiationDetailContent({ params }: PageProps) {
  const { id } = use(params);

  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [decisionPending, setDecisionPending] = useState(false);
  const [modifiedOffer, setModifiedOffer] = useState<number | "">("");
  const [reviewerNote, setReviewerNote] = useState("");

  const loadData = async () => {
    try {
      const data = await getNegotiationInternal(id);
      setState(data);
    } catch (err: any) {
      setError(err.message || "Failed to load negotiation session.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleCopyLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/join/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprovalAction = async (decision: "APPROVE" | "MODIFY" | "REJECT") => {
    setDecisionPending(true);
    try {
      await submitApproval(id, {
        decision,
        approvedOffer: decision === "MODIFY" ? Number(modifiedOffer) : undefined,
        reviewerNote: reviewerNote || undefined,
      });
      await loadData();
      setReviewerNote("");
    } catch (err: any) {
      alert("Error submitting decision: " + err.message);
    } finally {
      setDecisionPending(false);
    }
  };

  if (loading && !state) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading negotiation room...</p>
        </div>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Session Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">{error || "Negotiation record does not exist or has expired."}</p>
        <Link href="/hr" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold">
          Return to HR Dashboard
        </Link>
      </div>
    );
  }

  const candidate = state.candidate || {};
  const hrPrivate = state.hrPrivate || {};
  const history = state.history || [];
  const isPendingApproval = state.humanApproval?.status === "PENDING";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/hr"
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {candidate.name || "Candidate"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {state.role || "Software Engineer"}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Session ID: <code className="font-mono text-slate-600">{id.slice(0, 8)}</code> • Round {state.round ?? 0}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Link Copied!" : "Copy Candidate Link"}</span>
          </button>

          <Link
            href={`/hr/negotiation/${id}/report`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Evaluation Report</span>
          </Link>

          <Link
            href={`/join/${id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-blue-600 transition shadow-sm"
          >
            <span>Candidate View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Chat timeline (Left) + HR Private Intelligence (Right) */}
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Left 2 Cols: Conversation Feed */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          {/* Approval Banner if Escalation Triggered */}
          {isPendingApproval && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 shadow-sm animate-pulse-slow">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-amber-900">
                    Human Escalation Required
                  </h3>
                  <p className="text-xs text-amber-800 mt-1">
                    The agent reached a boundary threshold or counter-offer requiring HR decision.
                    {state.humanApproval?.reason && ` Reason: "${state.humanApproval.reason}"`}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleApprovalAction("APPROVE")}
                      disabled={decisionPending}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                    >
                      Approve Offer
                    </button>
                    <button
                      onClick={() => handleApprovalAction("REJECT")}
                      disabled={decisionPending}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition"
                    >
                      Hold Line / Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conversation History Card */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col h-[580px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Bot className="w-4 h-4 text-blue-600" />
                <span>Multi-Turn Dialogue Audit</span>
              </div>
              <span className="text-[11px] text-slate-400">Real-time synced</span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {history.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-10">No messages yet.</div>
              ) : (
                history.map((ev: any, idx: number) => {
                  const isAgent = ev.speaker === "agent";
                  const isCandidate = ev.speaker === "candidate";

                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 max-w-[85%] ${
                        isCandidate ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isAgent
                            ? "bg-blue-600 text-white shadow-xs"
                            : isCandidate
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-700 text-white"
                        }`}
                      >
                        {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                          isCandidate
                            ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                            : isAgent
                            ? "bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200/60"
                            : "bg-amber-100 text-amber-900 rounded-tl-none"
                        }`}
                      >
                        <div className="text-[10px] opacity-75 font-semibold uppercase mb-1">
                          {ev.speaker} • {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="whitespace-pre-wrap">{ev.message}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: HR Private Dossier */}
        <div className="space-y-5">
          {/* Compensation Metrics */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-blue-600" />
              Compensation Overview
            </h3>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs text-slate-500">Current Active Offer:</span>
                <span className="text-base font-bold text-blue-600">
                  ₹{(state.currentOffer || 0).toLocaleString("en-IN")}
                </span>
              </div>

              {state.candidateDemand && (
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Candidate Demand:</span>
                  <span className="text-sm font-semibold text-indigo-600">
                    ₹{state.candidateDemand.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {/* Private HR Vault indicators */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-2 mt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>HR Private Ceilings</span>
                </div>

                <div className="flex justify-between text-xs text-amber-950">
                  <span>Target Salary:</span>
                  <span className="font-bold">₹{(hrPrivate.targetSalary || 0).toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between text-xs text-amber-950">
                  <span>Max Budget Cap:</span>
                  <span className="font-bold text-rose-700">₹{(hrPrivate.maxBudget || 0).toLocaleString("en-IN")}</span>
                </div>

                {hrPrivate.constraints && (
                  <div className="pt-2 text-[11px] text-amber-800 border-t border-amber-200">
                    <span className="font-bold">Tactical Notes:</span> {hrPrivate.constraints}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Candidate Dossier */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              Candidate Dossier
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Email:</span>
                <span className="font-medium text-slate-800">{candidate.email || "N/A"}</span>
              </div>

              {candidate.interviewScores && candidate.interviewScores.length > 0 && (
                <div className="pt-2">
                  <span className="font-bold text-slate-700 block mb-2">Evaluated Scores:</span>
                  <div className="space-y-1.5">
                    {candidate.interviewScores.map((sc: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                        <span className="capitalize text-slate-600 font-medium">{sc.type}</span>
                        <span className="font-bold text-indigo-600">{sc.score}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NegotiationDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading negotiation room...</p>
          </div>
        </div>
      }
    >
      <NegotiationDetailContent params={params} />
    </Suspense>
  );
}

