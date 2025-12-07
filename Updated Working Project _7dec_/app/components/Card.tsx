import React from "react";

// FIX 1: Extend HTMLAttributes so TypeScript knows this component accepts onClick, id, style, etc.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "", ...props }: CardProps) {
  return (
    // FIX 2: Spread {...props} onto the div to actually attach the onClick event
    <div 
      className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 ${className}`}
      {...props} 
    >
      {children}
    </div>
  );
}