'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui';

interface RevenueExpenseData {
  month: string;
  revenue: number;
  expense: number;
}

interface RevenueExpenseChartProps {
  data: RevenueExpenseData[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatYAxis(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)}jt`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}rb`;
  }
  return value.toString();
}

export function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Pendapatan vs Pengeluaran
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={formatYAxis}
            />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(value as number),
                name === 'revenue' ? 'Pendapatan' : 'Pengeluaran'
              ]}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend
              formatter={(value) => value === 'revenue' ? 'Pendapatan' : 'Pengeluaran'}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#DC2626"
              strokeWidth={2}
              dot={{ fill: '#DC2626', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#6B7280"
              strokeWidth={2}
              dot={{ fill: '#6B7280', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default RevenueExpenseChart;
