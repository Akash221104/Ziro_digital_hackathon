"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Lock,
  TrendingUp,
  Brain,
  Scale,
  Users,
  Award,
  AlertTriangle,
  ChevronRight,
  FileText,
  Workflow,
  Target,
  BarChart3,
  Bot,
} from "lucide-react";

export const ProductVisionUSP: React.FC = () => {
  const scenarios = [
    { id: 1, name: "Weak negotiation", tag: "Passive Stance", desc: "Candidate accepts baseline offer without counter-argument; evaluates baseline outcome." },
    { id: 2, name: "Strong anchor", tag: "Assertive Anchor", desc: "Candidate leads with ambitious but well-calibrated opening anchor within budget bounds." },
    { id: 3, name: "Competing offer", tag: "External Leverage", desc: "Candidate leverages competing market offer (e.g. Google, Microsoft) professionally." },
    { id: 4, name: "Unrealistic demand", tag: "Budget Refusal", desc: "Candidate asks above company's max budget; AI refuses firmly without revealing ceiling." },
    { id: 5, name: "Passive candidate", tag: "Low Headroom", desc: "Minimal justification or market data provided; agent holds ground and probes value." },
    { id: 6, name: "Aggressive negotiation", tag: "Firm Boundaries", desc: "Hard bargaining tactics tested against polite, disciplined company guardrails." },
    { id: 7, name: "Market argument", tag: "Percentile Data", desc: "Candidate cites industry salary benchmarks, tier percentiles, and domain standards." },
    { id: 8, name: "Early concession", tag: "Pacing Audit", desc: "Candidate concedes early without extracting reciprocal non-cash considerations." },
    { id: 9, name: "Bonus negotiation", tag: "Non-Cash Tradeoff", desc: "Candidate trades off fixed CTC for signing bonus, retention incentives, or stock equity." },
    { id: 10, name: "Multiple concessions", tag: "Multi-Round Dance", desc: "Multi-turn iterative convergence testing agent patience and concession curve." },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 w-full">
      {/* Hero Quote Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 border border-indigo-900/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>THE CORE PRODUCT PHILOSOPHY</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            “A resume tells you what a candidate has done. <br className="hidden sm:inline" />
            An interview tells you what they know. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              But a negotiation tells you how they think.”
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto pt-2 leading-relaxed">
            AutoOffer re-architects compensation from a stressful manual bargaining friction into an autonomous, data-backed evidence generation round.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/hr"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
            >
              <span>Explore HR Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/hr/create"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-xs transition"
            >
              <span>Test Live Agent Session</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Section 1: The Paradigm Shift (Traditional vs OUR AGENT) */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Workflow className="w-3.5 h-3.5" />
            <span>Hiring Pipeline Evolution</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Traditional Hiring vs. OUR AGENT
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Why traditional talent acquisition loses candidates and misses critical behavioral signals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Traditional Hiring Card */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Traditional Hiring</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">Legacy Model</span>
              </div>

              {/* Pipeline Flow */}
              <div className="flex items-center justify-between gap-1 py-4 text-xs font-bold text-slate-700">
                <span className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200">Resume</span>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200">Interview</span>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200">Evaluation</span>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">Negotiation</span>
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                Evaluation ends when the offer is extended. Negotiation is treated merely as administrative friction where candidate behavior under commercial pressure is completely ignored.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Leaves HR with zero empirical evidence of candidate negotiation posture.</span>
            </div>
          </div>

          {/* OUR AGENT Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-emerald-50/60 border-2 border-blue-400/60 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-blue-200 mb-4">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">OUR AGENT PIPELINE</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-bold">AutoOffer Model</span>
              </div>

              {/* Pipeline Flow */}
              <div className="flex items-center justify-between gap-1 py-4 text-xs font-extrabold text-blue-950">
                <span className="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 shadow-2xs">Resume</span>
                <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 shadow-2xs">Interview</span>
                <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
                  Negotiation as Evaluation
                </span>
                <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">Hiring</span>
              </div>

              <div className="mt-3 p-3.5 rounded-xl bg-white/90 border border-blue-200 text-xs text-blue-950 leading-relaxed font-medium">
                <span className="font-bold text-blue-700 block mb-0.5">Our Key Differentiator:</span>
                The negotiation itself generates new, objective candidate evidence — scoring anchoring, justification quality, commercial awareness, and resilience.
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-blue-200 text-xs text-blue-800 flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Full behavioral scoring & audio-video timestamped moment replay for HR.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: OUR USP — Business Slide */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Target className="w-3.5 h-3.5" />
            <span>Core Business Positioning</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            OUR USP: Not Just A Chatbot
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Why AutoOffer commands defensible enterprise value.
          </p>
        </div>

        {/* The Pitch Card */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
              ❌ Don't Say (Weak Positioning)
            </span>
            <p className="text-base font-bold text-rose-950">
              “We have an AI HR chatbot.”
            </p>
            <p className="text-xs text-rose-800/80 mt-1">
              Generic, undifferentiated, easily commoditized, and fails to capture enterprise risk governance.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-300 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
              ✅ Say (Defensible Enterprise USP)
            </span>
            <p className="text-base font-bold text-emerald-950">
              “We turn salary negotiation into an AI-powered evaluation round.”
            </p>
            <p className="text-xs text-emerald-800 mt-1">
              Transforms a cost center into predictive talent intelligence with verifiable budget adherence.
            </p>
          </div>
        </div>

        {/* Strong Problem Statement */}
        <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-2">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">
            Strong Problem Statement
          </span>
          <p className="text-lg font-semibold leading-relaxed text-slate-100">
            “Companies evaluate what candidates know and what they have done, but rarely evaluate how they negotiate, justify their value and respond under pressure.”
          </p>
        </div>

        {/* 6 Industry Problems Solved */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Industry Problems AutoOffer Solves
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[
              {
                title: "Manual HR Fatigue",
                desc: "HR has to manually negotiate with every candidate across days and multiple time-zones.",
              },
              {
                title: "Static Candidate Data",
                desc: "Candidate interview ratings and past CTC data are rarely used dynamically during live bargaining.",
              },
              {
                title: "Subjective Judgments",
                desc: "HR must judge candidate leverage, market expectations, and commercial flexibility manually.",
              },
              {
                title: "Inconsistent Outcomes",
                desc: "Negotiations vary wildly between recruiters, leading to pay inequities and budget overruns.",
              },
              {
                title: "Advisory-Only Tools",
                desc: "Existing AI tools mostly recommend negotiation strategies; they don't actually conduct the negotiation.",
              },
              {
                title: "Zero Pressure Audits",
                desc: "No post-negotiation audit trail exists to evaluate how candidates respond to boundary pushback.",
              },
            ].map((p, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-slate-800 block mb-1">
                  {idx + 1}. {p.title}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: 🛡️ Guardrails & Privacy */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Governance & Compliance</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            🛡️ Strict Enterprise Guardrails
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Essential architectural boundaries for an enterprise HR platform.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Candidate Privacy Vault */}
          <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-3">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>Zero-Leak Candidate Privacy</span>
              </div>
              <p className="text-xs text-amber-800 mb-4">
                The candidate <span className="font-bold underline">NEVER</span> sees or hears:
              </p>
              <ul className="space-y-2 text-xs font-semibold text-amber-950">
                <li className="flex items-center gap-2">
                  <span className="text-rose-600 font-bold">❌</span> Maximum Budget
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-600 font-bold">❌</span> Target Salary
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-600 font-bold">❌</span> Internal HR Strategy
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-600 font-bold">❌</span> Internal Evaluation & Scores
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-600 font-bold">❌</span> Tool Results & LLM Internals
                </li>
              </ul>
            </div>
            <div className="mt-5 pt-3 border-t border-amber-200 text-[11px] text-amber-800">
              Guaranteed by candidate-safe serialization & client sanitizers.
            </div>
          </div>

          {/* Human Approval Gate */}
          <div className="p-6 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm mb-3">
                <Users className="w-4 h-4 text-indigo-700" />
                <span>Human-In-The-Loop Approval</span>
              </div>
              <p className="text-xs text-indigo-800 mb-4">
                When proposed offers exceed standard target thresholds:
              </p>
              <div className="space-y-2 text-center text-xs font-bold text-indigo-950">
                <div className="p-2 rounded-lg bg-white border border-indigo-200 shadow-2xs">
                  AI Recommendation
                </div>
                <div className="text-indigo-400 font-bold text-sm">↓</div>
                <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-xs">
                  Human Approval Checkpoint
                </div>
                <div className="text-indigo-400 font-bold text-sm">↓</div>
                <div className="p-2 rounded-lg bg-white border border-indigo-200 shadow-2xs text-[11px]">
                  Approve / Modify / Reject
                </div>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-indigo-200 text-[11px] text-indigo-800">
              AI holds neutral stance until HR manager approves or modifies offer.
            </div>
          </div>

          {/* Refusal Handling */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Refusal Without Leaking</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                When candidate asks above company constraints:
              </p>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed italic">
                “I understand your expectation. However, I am not able to support that compensation level for this role. We can explore the strongest package available within the role's range.”
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-200 text-[11px] text-emerald-700 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Refuses professionally without revealing hidden maximum.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: 📊 10 Evaluation Benchmark Scenarios */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Measurable Validation</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              📊 10 Empirical Evaluation Scenarios
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Demonstrating observable measurement across diverse real-world candidate tactics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              100% Guardrail Compliance
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {scenarios.map((sc) => (
            <div
              key={sc.id}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-blue-300 hover:bg-white hover:shadow-xs transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                    {sc.id}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-semibold">
                    {sc.tag}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mb-1">{sc.name}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{sc.desc}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Audited & Scored</span>
              </div>
            </div>
          ))}
        </div>

        {/* 6 Dimension Model Preview */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-blue-300 font-bold uppercase tracking-wider block">
              Six-Dimension Scoring Architecture (0-100 pts)
            </span>
            <p className="text-xs text-slate-300 max-w-xl">
              1. Anchoring (20) • 2. Justification (20) • 3. Market Awareness (15) • 4. Leverage (15) • 5. Timing (15) • 6. Final Outcome (15)
            </p>
          </div>
          <Link
            href="/hr"
            className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shrink-0"
          >
            View Live Session Reports
          </Link>
        </div>
      </div>
    </div>
  );
};

