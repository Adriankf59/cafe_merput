'use client';

import React from 'react';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { StatCard, WeeklySalesChart, TopProductsChart } from '@/components/features/dashboard';
import {
  mockDashboardStats,
  mockWeeklySales,
  mockTopProducts,
} from '@/lib/data/mockData';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardPage() {
  const stats = mockDashboardStats;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<DollarSign className="w-6 h-6 text-red-600" />}
          iconBgColor="bg-red-100"
          title="Total Penjualan"
          value={formatCurrency(stats.totalSales)}
          change={stats.salesChange}
          changeLabel="vs bulan lalu"
        />
        <StatCard
          icon={<ShoppingCart className="w-6 h-6 text-blue-600" />}
          iconBgColor="bg-blue-100"
          title="Transaksi Hari Ini"
          value={stats.todayTransactions.toString()}
          change={stats.transactionsChange}
          changeLabel="vs kemarin"
        />
        <StatCard
          icon={<Users className="w-6 h-6 text-green-600" />}
          iconBgColor="bg-green-100"
          title="Pegawai Aktif"
          value={stats.activeEmployees.toString()}
          change={stats.employeesChange}
          changeLabel="vs bulan lalu"
        />
        <StatCard
          icon={<Package className="w-6 h-6 text-purple-600" />}
          iconBgColor="bg-purple-100"
          title="Produk Terjual"
          value={stats.productsSold.toString()}
          change={stats.productsSoldChange}
          changeLabel="vs minggu lalu"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklySalesChart data={mockWeeklySales} />
        <TopProductsChart data={mockTopProducts} />
      </div>
    </div>
  );
}
