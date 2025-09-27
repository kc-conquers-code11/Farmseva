'use client';

import React from 'react';

type CardProps = {
  className?: string;
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  borderColor?: string;
};

export default function Card({ className = '', children, padding = 'md', borderColor = 'border-neutral-100' }: CardProps) {
  const pad = padding === 'sm' ? 'p-4' : padding === 'lg' ? 'p-8' : 'p-6';
  return (
    <div className={`bg-white rounded-2xl ${pad} shadow-sm border ${borderColor} ${className}`}>
      {children}
    </div>
  );
}
