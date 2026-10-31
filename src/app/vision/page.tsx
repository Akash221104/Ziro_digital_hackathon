// src/app/vision/page.tsx
import React from "react";
import { ProductVisionUSP } from "@/components/ProductVisionUSP";

export const metadata = {
  title: "Product Vision & USP | AutoOffer AI",
  description: "Traditional Hiring vs. OUR AGENT: Turning salary negotiation into an AI-powered evaluation round with strict enterprise guardrails.",
};

export default function VisionPage() {
  return (
    <div className="flex-1 bg-slate-50/60 min-h-screen">
      <ProductVisionUSP />
    </div>
  );
}

