import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoOffer AI - Autonomous HR Salary Negotiation Agent",
  description: "Enterprise autonomous salary negotiation platform with real-time market benchmarking and human-in-the-loop governance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50/70 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
        <Suspense fallback={<div className="h-16 border-b border-slate-200/80 bg-white" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2026 AutoOffer AI. Powered by Intelligent Agentic Workflows.</p>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Guardrailed Limits</span>
              <span>•</span>
              <span>Human Escalation</span>
              <span>•</span>
              <span>Zero Leak Privacy</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
