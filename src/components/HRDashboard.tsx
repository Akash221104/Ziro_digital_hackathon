"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { NegotiationState } from "@/types/negotiation";
import { getNegotiations, createNegotiation } from "@/lib/api";
import {
  Users,
  Search,
  PlusCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  Compass,
} from "lucide-react";
import { ProductVisionUSP } from "./ProductVisionUSP";

export const HRDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"sessions" | "vision">("sessions");
  const [negotiations, setNegotiations] = useState<NegotiationState[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const fetchNegotiations = async () => {
    setLoading(true);
    try {
      const res = await getNegotiations();
      if (res && Array.isArray(res.negotiations)) {
        setNegotiations(res.negotiations);
      }
    } catch (err) {
      console.error("Failed to load negotiations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNegotiations();
  }, []);

  const handleCopyLink = (id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/join/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSeedSampleData = async () => {
    setSeeding(true);
    try {
      const samples = [
        {
          candidate: {
            name: "Priya Sharma",
            email: "priya.sharma@example.com",
            interviewScores: [
              { interviewId: "t-1", type: "technical", score: 92, notes: "Excellent system design and React skills" },
              { interviewId: "h-1", type: "hr", score: 88, notes: "High ownership, strong communication" },
            ],
          },
          role: "Senior Full Stack Engineer",
          experience: "6",
          location: "Bengaluru, India (Hybrid)",
          initialOffer: 2400000,
          expectedSalary: 3000000,
          hrPrivate: {
            targetSalary: 2700000,
            maxBudget: 3200000,
            constraints: "Can offer ₹2L joining bonus if candidate commits to joining within 15 days.",
            internalScores: { leadership: 90, culture: 85 },
          },
        },
        {
          candidate: {
            name: "Arjun Verma",
            email: "arjun.v@example.com",
            interviewScores: [
              { interviewId: "t-1", type: "technical", score: 85, notes: "Solid PyTorch and distributed systems depth" },
              { interviewId: "h-1", type: "hr", score: 80, notes: "Prefers remote work, ambitious" },
            ],
          },
          role: "AI / ML Platform Specialist",
          experience: "4",
          location: "Remote (India)",
          initialOffer: 2800000,
          expectedSalary: 3500000,
          hrPrivate: {
            targetSalary: 3100000,
            maxBudget: 3400000,
            constraints: "Hard cap at 34L. Can offer ESOPs up to ₹5L to bridge cash demand.",
            internalScores: { autonomy: 92 },
          },
        },
      ];

      for (const sample of samples) {
        await createNegotiation(sample);
      }
      await fetchNegotiations();
    } catch (err) {
      console.error("Seeding failed", err);
    } finally {
      setSeeding(false);
    }
  };

  const filtered = negotiations.filter((item) => {
    const candidateName = item.candidate?.name?.toLowerCase() ?? "";
    const role = item.role?.toLowerCase() ?? "";
    const query = search.toLowerCase();
    const matchesSearch = candidateName.includes(query) || role.includes(query);

    if (statusFilter === "ALL") return matchesSearch;
    if (statusFilter === "NEEDS_APPROVAL") {
      return matchesSearch && item.humanApproval?.status === "PENDING";
    }
    return matchesSearch && item.status?.toUpperCase() === statusFilter;
  });

  const totalCount = negotiations.length;
  const activeCount = negotiations.filter((n) => n.status === "ongoing").length;
  const pendingApprovals = negotiations.filter((n) => n.humanApproval?.status === "PENDING").length;
  const completedCount = negotiations.filter((n) => n.status === "completed").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-blue-600 font-semibold">HR Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Salary Negotiation Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor autonomous negotiation rounds, supervise budget guardrails, and approve counter-offers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchNegotiations}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-sm"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {negotiations.length === 0 && (
            <button
              onClick={handleSeedSampleData}
              disabled={seeding}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{seeding ? "Generating..." : "Load Demo Scenarios"}</span>
            </button>
          )}

          <Link
            href="/hr/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/15 transition-all hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Negotiation</span>
          </Link>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 mt-6 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("sessions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "sessions"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Sessions & Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab("vision")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "vision"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Product Vision & USP</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-800 border border-amber-300">
            USP
          </span>
        </button>
      </div>

      {activeTab === "vision" ? (
        <div className="mt-4 -mx-4 sm:-mx-6 lg:-mx-8">
          <ProductVisionUSP />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Sessions</div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{totalCount}</div>
            <div className="text-xs text-slate-400 mt-1">Managed by AI</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">In Progress</div>
            <div className="text-2xl sm:text-3xl font-bold text-sky-600 mt-1">{activeCount}</div>
            <div className="text-xs text-slate-400 mt-1">Multi-turn active</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Review</div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1">{pendingApprovals}</div>
            <div className="text-xs text-amber-600 font-medium mt-1">Requires HR Decision</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Offers Closed</div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">{completedCount}</div>
            <div className="text-xs text-slate-400 mt-1">Consensus reached</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 border border-slate-200/70 w-full sm:w-auto overflow-x-auto">
          {[
            { id: "ALL", label: "All Sessions" },
            { id: "ONGOING", label: "Active" },
            { id: "NEEDS_APPROVAL", label: "Approval Required" },
            { id: "COMPLETED", label: "Closed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table / List */}
      <div className="mt-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading negotiation records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No negotiations found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              {negotiations.length === 0
                ? "Get started by generating your first negotiation or load pre-built demo scenarios."
                : "No negotiations match your search or filter criteria."}
            </p>
            {negotiations.length === 0 && (
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleSeedSampleData}
                  disabled={seeding}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition"
                >
                  Load Demo Scenarios
                </button>
                <Link
                  href="/hr/create"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Create Negotiation
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Candidate</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Current Offer</th>
                  <th className="py-3.5 px-4">Rounds</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right sm:pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((item) => {
                  const id = item.id || "session";
                  const candidateName = item.candidate?.name || "Candidate";
                  const candidateEmail = item.candidate?.email || "No email provided";
                  const role = item.role || "Software Engineer";
                  const isPendingApproval = item.humanApproval?.status === "PENDING";
                  const isCompleted = item.status === "completed";

                  return (
                    <tr
                      key={id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-200/60 shadow-xs">
                            {candidateName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition">
                              {candidateName}
                            </div>
                            <div className="text-xs text-slate-400">{candidateEmail}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          {role}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-900">
                        ₹{(item.currentOffer || 0).toLocaleString("en-IN")}
                        {item.candidateDemand && (
                          <div className="text-[11px] text-slate-400 font-normal">
                            Demanding ₹{item.candidateDemand.toLocaleString("en-IN")}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-slate-600 text-xs">
                        Round {item.round ?? 0}
                      </td>

                      <td className="py-4 px-4">
                        {isPendingApproval ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Approval Required
                          </span>
                        ) : isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-sky-500"></span>
                            Ongoing
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right sm:pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopyLink(id)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                            title="Copy Candidate Portal Link"
                          >
                            {copiedId === id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <Link
                            href={`/hr/negotiation/${id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-blue-600 transition shadow-xs"
                          >
                            <span>Open Room</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={`/hr/negotiation/${id}/report`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition shadow-xs"
                          >
                            <span>Report</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};
