'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui';

interface CategorySalesData {
  jenis_produk: string;
  percentage: number;
  total: number;
}

interface CategorySalesChartProps {
  data: CategorySalesData[];
}

const COLORS = ['#DC2626', '#F87171', '#FCA5A5'];

export function CategorySalesChart({ data }: CategorySalesChartProps) {
  // Transform data for chart
  const chartData = data.map((item, index) => ({
    category: item.jenis_produk,
    percentage: Math.round(item.percentage * 10) / 10,
    total: item.total,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Penjualan per Kategori
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="55%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="percentage"
              nameKey="category"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value}%`, 'Persentase']}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ paddingLeft: '30px' }}
              formatter={(value) => {
                const item = chartData.find(d => d.category === value);
                return (
                  <span className="text-sm text-gray-700">
                    {value} ({item?.percentage}%)
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default CategorySalesChart;
