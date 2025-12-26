'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, ShoppingCart, Users, Package, RefreshCw } from 'lucide-react';
import { StatCard, WeeklySalesChart, TopProductsChart } from '@/components/features/dashboard';

interface DashboardStats {
  totalSales: number;
  todayTransactions: number;
  activeEmployees: number;
  productsSold: number;
}

interface WeeklySalesData {
  day: string;
  sales: number;
}

interface TopProduct {
  produk_id: string;
  nama_produk: string;
  jenis_produk: string;
  totalSold: number;
  revenue: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weeklySales, setWeeklySales] = useState<WeeklySalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);
      
      // Fetch all dashboard data in parallel
      const [statsRes, weeklySalesRes, topProductsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/weekly-sales'),
        fetch('/api/dashboard/top-products'),
      ]);

      const [statsData, weeklySalesData, topProductsData] = await Promise.all([
        statsRes.json(),
        weeklySalesRes.json(),
        topProductsRes.json(),
      ]);

      if (statsData.success) {
        setStats({
          totalSales: Number(statsData.data.totalSales) || 0,
          todayTransactions: Number(statsData.data.todayTransactions) || 0,
          activeEmployees: Number(statsData.data.activeEmployees) || 0,
          productsSold: Number(statsData.data.productsSold) || 0,
        });
      }

      if (weeklySalesData.success) {
        setWeeklySales(weeklySalesData.data.map((d: { day: string; sales: string | number }) => ({
          day: d.day,
          sales: Number(d.sales) || 0,
        })));
      }

      if (topProductsData.success) {
        setTopProducts(topProductsData.data.map((p: Record<string, unknown>) => ({
          produk_id: p.produk_id as string,
          nama_produk: p.nama_produk as string,
          jenis_produk: p.jenis_produk as string,
          totalSold: Number(p.totalSold) || 0,
          revenue: Number(p.revenue) || 0,
        })));
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(false);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Update: {lastUpdated.toLocaleTimeString('id-ID')}
            </span>
          )}
          <button
            onClick={() => fetchDashboardData(false)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<DollarSign className="w-6 h-6 text-red-600" />}
          iconBgColor="bg-red-100"
          title="Total Penjualan"
          value={formatCurrency(stats?.totalSales || 0)}
          changeLabel="Hari ini"
        />
        <StatCard
          icon={<ShoppingCart className="w-6 h-6 text-blue-600" />}
          iconBgColor="bg-blue-100"
          title="Transaksi Hari Ini"
          value={(stats?.todayTransactions || 0).toString()}
          changeLabel="Transaksi"
        />
        <StatCard
          icon={<Users className="w-6 h-6 text-green-600" />}
          iconBgColor="bg-green-100"
          title="Pegawai Aktif"
          value={(stats?.activeEmployees || 0).toString()}
          changeLabel="Pegawai"
        />
        <StatCard
          icon={<Package className="w-6 h-6 text-purple-600" />}
          iconBgColor="bg-purple-100"
          title="Produk Terjual"
          value={(stats?.productsSold || 0).toString()}
          changeLabel="Hari ini"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklySalesChart data={weeklySales} />
        <TopProductsChart data={topProducts} />
      </div>
    </div>
  );
}
