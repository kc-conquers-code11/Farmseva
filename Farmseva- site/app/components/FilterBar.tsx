'use client';

import React from 'react';

type FilterBarProps = {
  children: React.ReactNode;
};

export default function FilterBar({ children }: FilterBarProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">{children}</div>
  );
}
