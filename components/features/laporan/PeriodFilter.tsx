'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

export type PeriodType = '7days' | '30days' | '3months' | '6months' | '1year';

interface PeriodFilterProps {
  value: PeriodType;
  onChange: (period: PeriodType) => void;
}

const periodOptions: { value: PeriodType; label: string }[] = [
  { value: '7days', label: '7 Hari Terakhir' },
  { value: '30days', label: '30 Hari Terakhir' },
  { value: '3months', label: '3 Bulan Terakhir' },
  { value: '6months', label: '6 Bulan Terakhir' },
  { value: '1year', label: '1 Tahun Terakhir' },
];

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-5 h-5 text-gray-500" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as PeriodType)}
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
      >
        {periodOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default PeriodFilter;
