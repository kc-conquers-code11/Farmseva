'use client';

import React from 'react';

type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
      <div className="mb-4">
        <h3 className="text-xl font-medium text-neutral-800">{title}</h3>
        {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
      </div>
      <div className="h-80">{children}</div>
    </div>
  );
}
