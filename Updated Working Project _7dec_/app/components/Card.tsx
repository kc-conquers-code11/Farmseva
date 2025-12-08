import React from "react";

// FIX: Added 'className' (optional string) to the interface
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    // FIX: Added ${className} to the div so it accepts your custom styles
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 ${className}`}>
      {children}
    </div>
  );
}