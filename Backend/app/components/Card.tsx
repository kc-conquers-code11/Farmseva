import React from "react";

export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
      {children}
    </div>
  );
}
