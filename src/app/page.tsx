import React from "react";
import Link from "next/link";
import {
  Bot,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  ArrowRight,
  Sparkles,
  Lock,
  MessageSquare,
  Sliders,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-400/20 via-indigo-300/15 to-purple-400/20 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold tracking-wide mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>Autonomous AI HR Negotiation Agent</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Empathetic, Data-Driven Salary Negotiations{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent block sm:inline">
              with Zero Compromise
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Close top candidates faster without stretching company budgets. Our autonomous agent conducts structured multi-turn compensation conversations with strict HR guardrails, automated market benchmarks, and human approval safeguards.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/hr"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5"
            >
              <span>Open HR Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/hr/create"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all hover:-translate-y-0.5"
            >
              <span>Create New Negotiation</span>
            </Link>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-2xl font-bold text-slate-900">100%</div>
              <div className="text-xs text-slate-500 mt-1">Budget Ceiling Adherence</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">&lt; 2 mins</div>
              <div className="text-xs text-slate-500 mt-1">Candidate Response Time</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">Zero Leak</div>
              <div className="text-xs text-slate-500 mt-1">HR Constraints Security</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-2xl font-bold text-emerald-600">Human Loop</div>
              <div className="text-xs text-slate-500 mt-1">Real-Time Approval Control</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section className="py-16 bg-white border-t border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Architected for Precision</h2>
            <h3 className="text-3xl font-bold text-slate-900">How the Autonomous Agent Works</h3>
            <p className="text-slate-600 mt-2 text-sm">
              Combining LLM empathy with deterministic business logic and human governance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-blue-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Hard Budget Guardrails</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                The agent strictly enforces target salaries and hard max ceilings. Internal limits are isolated on the server and completely inaccessible to the candidate client.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Dynamic Benchmarking</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Evaluates candidate interview ratings (technical + behavioral) to calculate fair counter-offers and offer concessions using calculated curves.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Human-in-the-Loop Escalation</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Whenever a counter-offer reaches edge thresholds or requires exceptional budget allocation, the agent pauses and prompts HR for 1-click approval or modification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Launch CTA */}
      <section className="py-14 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Ready to Start a Compensation Session?</h2>
          <p className="mt-3 text-blue-200 text-sm max-w-xl mx-auto">
            Input candidate interview scores, set your target and budget ceilings, and generate an interactive negotiation room in seconds.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/hr/create"
              className="px-6 py-3 rounded-xl font-semibold bg-white text-blue-950 hover:bg-blue-50 transition shadow-lg"
            >
              Start Session Setup
            </Link>
            <Link
              href="/hr"
              className="px-6 py-3 rounded-xl font-semibold bg-blue-800/80 hover:bg-blue-800 text-white border border-blue-700/60 transition"
            >
              View Active Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
