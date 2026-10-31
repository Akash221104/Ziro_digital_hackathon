"use client";

import React, { useState } from "react";
import { createNegotiation } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  User,
  Briefcase,
  Award,
  DollarSign,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";

export const NegotiationForm: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live state for budget visual preview
  const [initialOffer, setInitialOffer] = useState<number>(2000000);
  const [expectedSalary, setExpectedSalary] = useState<number>(2600000);
  const [targetSalary, setTargetSalary] = useState<number>(2300000);
  const [maxBudget, setMaxBudget] = useState<number>(2800000);
  const [techScore, setTechScore] = useState<number>(85);
  const [hrScore, setHrScore] = useState<number>(80);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      candidate: {
        name: (formData.get("candidateName") as string) || "",
        email: (formData.get("candidateEmail") as string) || "",
        resumeUrl: (formData.get("resume") as string) || "",
      },
      role: (formData.get("role") as string) || "Software Engineer",
      experience: (formData.get("experience") as string) || "5",
      location: (formData.get("location") as string) || "",
      resume: (formData.get("resume") as string) || "",
      previousInterviewScores: {
        technical: Number(formData.get("techScore")) || techScore,
        hr: Number(formData.get("hrScore")) || hrScore,
        notes: (formData.get("interviewNotes") as string) || "",
      },
      initialOffer: Number(formData.get("initialOffer")) || initialOffer,
      expectedSalary: Number(formData.get("expectedSalary")) || expectedSalary,
      hrPrivate: {
        targetSalary: Number(formData.get("targetSalary")) || targetSalary,
        maxBudget: Number(formData.get("maxBudget")) || maxBudget,
        constraints: (formData.get("constraints") as string) || "",
      },
    };

    try {
      const result = await createNegotiation(data);
      const id = result.id || result.negotiationId;
      if (id) {
        router.push(`/hr/negotiation/${id}`);
      } else {
        router.push("/hr");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const budgetBuffer = maxBudget - targetSalary;
  const isBudgetValid = maxBudget >= initialOffer;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Session Configuration</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Create AI Negotiation Session
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Initialize candidate parameters, interview scores, and strict HR-only private budget guardrails.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Card 1: Candidate Info */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">1. Candidate Information</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Candidate Full Name *</label>
                <input
                  name="candidateName"
                  type="text"
                  required
                  defaultValue="Kavita Krishnan"
                  placeholder="e.g. Kavita Krishnan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Candidate Email *</label>
                <input
                  name="candidateEmail"
                  type="email"
                  required
                  defaultValue="kavita.k@example.com"
                  placeholder="candidate@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Job Title *</label>
                <input
                  name="role"
                  type="text"
                  required
                  defaultValue="Lead Frontend Architect"
                  placeholder="e.g. Lead Frontend Architect"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Experience (Years) *</label>
                <input
                  name="experience"
                  type="number"
                  required
                  defaultValue="7"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location *</label>
                <input
                  name="location"
                  type="text"
                  required
                  defaultValue="Bengaluru (Hybrid)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resume Link / Context</label>
                <input
                  name="resume"
                  type="text"
                  defaultValue="https://linkedin.com/in/example-resume"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Interview Performance */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">2. Past Interview Evaluations</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Technical Score (0-100)</span>
                  <span className="text-indigo-600 font-bold">{techScore}%</span>
                </div>
                <input
                  name="techScore"
                  type="range"
                  min="0"
                  max="100"
                  value={techScore}
                  onChange={(e) => setTechScore(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>HR / Behavioral Score (0-100)</span>
                  <span className="text-indigo-600 font-bold">{hrScore}%</span>
                </div>
                <input
                  name="hrScore"
                  type="range"
                  min="0"
                  max="100"
                  value={hrScore}
                  onChange={(e) => setHrScore(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Interviewer Notes</label>
                <textarea
                  name="interviewNotes"
                  rows={2}
                  defaultValue="Top 5% candidate. Outstanding architecture clarity. Showed strong communication during system design."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Salary & HR Private Guardrails */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">3. Offer & Compensation Setup</h2>
                <p className="text-xs text-slate-500">Public baseline offers visible to candidate.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Formal Offer (₹) *</label>
                <input
                  name="initialOffer"
                  type="number"
                  required
                  value={initialOffer}
                  onChange={(e) => setInitialOffer(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Candidate Expected Salary (₹) *</label>
                <input
                  name="expectedSalary"
                  type="number"
                  required
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                />
              </div>
            </div>

            {/* HR Private Vault */}
            <div className="mt-6 p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>HR PRIVATE VAULT (Never shared with candidate)</span>
              </div>
              <p className="text-xs text-amber-700 mb-4">
                These constraints dictate the AI agent's internal reasoning and negotiation ceiling.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Internal Target Salary (₹) *</label>
                  <input
                    name="targetSalary"
                    type="number"
                    required
                    value={targetSalary}
                    onChange={(e) => setTargetSalary(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-400 bg-white text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Absolute Maximum Budget (₹) *</label>
                  <input
                    name="maxBudget"
                    type="number"
                    required
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-400 bg-white text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Internal Tactics & Constraints</label>
                  <textarea
                    name="constraints"
                    rows={2}
                    defaultValue="Candidate holds a competing offer. Can offer up to 2L retention bonus if joined within 3 weeks. Retain flexibility on stock options."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-400 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isBudgetValid}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Initializing Session...</span>
            ) : (
              <>
                <span>Launch Autonomous Negotiation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Sidebar Summary & Live Guardrail Health */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm sticky top-24">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Guardrail Health Check
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-600">Starting Offer:</span>
                <span className="font-semibold text-slate-900">₹{initialOffer.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-600">Candidate Demand:</span>
                <span className="font-semibold text-indigo-600">₹{expectedSalary.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-600">Target Budget:</span>
                <span className="font-semibold text-slate-900">₹{targetSalary.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-600">Max Ceiling:</span>
                <span className="font-semibold text-rose-600">₹{maxBudget.toLocaleString("en-IN")}</span>
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Budget Buffer Headroom</span>
                  <span className="font-bold text-emerald-600">₹{Math.max(0, budgetBuffer).toLocaleString("en-IN")}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(10, ((maxBudget - initialOffer) / (maxBudget || 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 flex gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  The agent will aim to settle near ₹{targetSalary.toLocaleString("en-IN")}. Any counter-offer exceeding ₹{maxBudget.toLocaleString("en-IN")} will trigger an instant human escalation.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
