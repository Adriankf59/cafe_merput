'use client';

import React, { useState } from 'react';
import { DollarSign, TrendingDown, Wallet, ShoppingCart, Download } from 'lucide-react';
import { Button } from '@/components/ui';
import {
  ReportStatCard,
  RevenueExpenseChart,
  CategorySalesChart,
  PeriodFilter,
  type PeriodType,
} from '@/components/features/laporan';
import {
  mockReportStats,
  mockMonthlyData,
  mockCategorySales,
} from '@/lib/data/mockData';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function LaporanPage() {
  const [period, setPeriod] = useState<PeriodType>('1year');

  // Filter data based on period (mock implementation)
  const getFilteredMonthlyData = () => {
    switch (period) {
      case '7days':
        return mockMonthlyData.slice(-1);
      case '30days':
        return mockMonthlyData.slice(-1);
      case '3months':
        return mockMonthlyData.slice(-3);
      case '6months':
        return mockMonthlyData.slice(-6);
      case '1year':
      default:
        return mockMonthlyData;
    }
  };

  const handleExport = () => {
    // Mock export functionality
    alert('Fitur export akan segera tersedia');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
        <div className="flex items-center gap-4">
          <PeriodFilter value={period} onChange={setPeriod} />
          <Button variant="primary" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <ReportStatCard
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          iconBgColor="bg-green-100"
          title="Total Pendapatan"
          value={formatCurrency(mockReportStats.totalRevenue)}
          change={mockReportStats.revenueChange}
          changeLabel="vs periode sebelumnya"
        />
        <ReportStatCard
          icon={<TrendingDown className="w-6 h-6 text-red-600" />}
          iconBgColor="bg-red-100"
          title="Total Pengeluaran"
          value={formatCurrency(mockReportStats.totalExpenses)}
          change={-mockReportStats.expensesChange}
          changeLabel="vs periode sebelumnya"
        />
        <ReportStatCard
          icon={<Wallet className="w-6 h-6 text-blue-600" />}
          iconBgColor="bg-blue-100"
          title="Laba Bersih"
          value={formatCurrency(mockReportStats.netProfit)}
          change={mockReportStats.profitChange}
          changeLabel="vs periode sebelumnya"
        />
        <ReportStatCard
          icon={<ShoppingCart className="w-6 h-6 text-purple-600" />}
          iconBgColor="bg-purple-100"
          title="Total Transaksi"
          value={mockReportStats.totalTransactions.toLocaleString('id-ID')}
          change={mockReportStats.transactionsChange}
          changeLabel="vs periode sebelumnya"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueExpenseChart data={getFilteredMonthlyData()} />
        </div>
        <div>
          <CategorySalesChart data={mockCategorySales} />
        </div>
      </div>
    </div>
  );
}
