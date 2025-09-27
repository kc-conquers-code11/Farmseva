'use client';

import React from 'react';
import { Icon } from '@iconify/react';

type SearchInputProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export default function SearchInput({ value, onChange, placeholder = 'Search...' }: SearchInputProps) {
  return (
    <div className="relative">
      <Icon icon="mdi:search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
      />
    </div>
  );
}
