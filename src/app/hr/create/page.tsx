// src/app/hr/create/page.tsx
import React from "react";
import { NegotiationForm } from "@/components/NegotiationForm";

export default function CreateNegotiationPage() {
  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <h1 className="text-center text-3xl font-bold mb-8">Create New Negotiation</h1>
      <NegotiationForm />
    </div>
  );
}
