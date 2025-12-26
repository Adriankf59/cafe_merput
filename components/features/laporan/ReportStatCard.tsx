'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui';

interface ReportStatCardProps {
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  value: string;
  change?: number;
  changeLabel: string;
}

export function ReportStatCard({
  icon,
  iconBgColor,
  title,
  value,
  change,
  changeLabel,
}: ReportStatCardProps) {
  const isPositive = change !== undefined ? change >= 0 : true;
  const showChange = change !== undefined;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${iconBgColor}`}>
          {icon}
        </div>
        {showChange && (
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{isPositive ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
      </div>
      <p className="text-xs text-gray-400 mt-2">{changeLabel}</p>
    </Card>
  );
}

export default ReportStatCard;
