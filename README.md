# Ziro_digital_hackathon

# AutoOffer AI — Autonomous HR Salary Negotiation Agent

> **“A resume tells you what a candidate has done. An interview tells you what they know. But a negotiation tells you how they think.”**

AutoOffer AI is an enterprise-grade autonomous HR salary negotiation platform combining real-time multi-turn voice meetings (LiveKit + VerbX), strict HR budget guardrails, human-in-the-loop governance checkpoints, and an objective 6-dimension candidate evaluation engine.

---

## 🚀 Key Features

* **Live Voice & Video Negotiation**: Candidate and AI HR Avatar interact in real time with LiveKit signaling and VerbX TTS / Web Speech recognition.
* **Strict HR Privacy Vault**: The candidate never sees hidden constraints (Target Salary, Maximum Budget, Internal HR Strategy, Internal Scores).
* **Deterministic Tool Framework**: Live salary benchmarking, total compensation calculation, and candidate signal analysis.
* **Human-in-the-Loop Approval**: Automatic escalation gate when candidate demands or agent proposals exceed standard target bands.
* **Objective Evaluation Engine**: Scores candidates across 6 dimensions (Anchoring, Justification, Market Awareness, Leverage, Timing, and Outcome Efficiency) out of 100 points.
* **Executive HR Report & Moment Replay**: Deep post-negotiation analytics with timestamped clickable moment replay.

---

## 🛠️ Tech Stack

* **Framework**: Next.js 16 (Turbopack, App Router)
* **Real-time Video & Audio**: LiveKit Client & Server SDK
* **Speech & Voice**: VerbX TTS & STT, Web Speech API
* **Intelligence**: OpenRouter / Groq LLM integration
* **Language & Styling**: TypeScript, Tailwind CSS, Lucide Icons

---

## 🏁 Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.
