'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingDown, Wallet, ShoppingCart, Download } from 'lucide-react';
import { Button } from '@/components/ui';
import {
  ReportStatCard,
  RevenueExpenseChart,
  CategorySalesChart,
  PeriodFilter,
  type PeriodType,
} from '@/components/features/laporan';

interface ReportSummary {
  revenue: number;
  expenses: number;
  profit: number;
  transactions: number;
  period: string;
}

interface RevenueExpenseData {
  month: string;
  revenue: number;
  expense: number;
}

interface CategorySalesData {
  jenis_produk: string;
  percentage: number;
  total: number;
}

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
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [revenueExpense, setRevenueExpense] = useState<RevenueExpenseData[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const getPeriodParam = (): string => {
    switch (period) {
      case '7days':
        return 'weekly';
      case '30days':
        return 'monthly';
      case '3months':
      case '6months':
      case '1year':
      default:
        return 'monthly';
    }
  };

  const getMonthsParam = (): number => {
    switch (period) {
      case '3months':
        return 3;
      case '6months':
        return 6;
      case '1year':
      default:
        return 12;
    }
  };

  const getDaysParam = (): number | null => {
    switch (period) {
      case '7days':
        return 7;
      default:
        return null;
    }
  };

  const getWeeksParam = (): number | null => {
    switch (period) {
      case '30days':
        return 4; // 4 weeks for 30 days
      default:
        return null;
    }
  };

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      
      // Build revenue-expense URL based on period
      const daysParam = getDaysParam();
      const weeksParam = getWeeksParam();
      let revenueExpenseUrl: string;
      
      if (daysParam) {
        revenueExpenseUrl = `/api/reports/revenue-expense?days=${daysParam}`;
      } else if (weeksParam) {
        revenueExpenseUrl = `/api/reports/revenue-expense?weeks=${weeksParam}`;
      } else {
        revenueExpenseUrl = `/api/reports/revenue-expense?months=${getMonthsParam()}`;
      }
      
      const [summaryRes, revenueExpenseRes, categorySalesRes] = await Promise.all([
        fetch(`/api/reports/summary?period=${getPeriodParam()}`),
        fetch(revenueExpenseUrl),
        fetch('/api/reports/category-sales'),
      ]);

      const [summaryData, revenueExpenseData, categorySalesData] = await Promise.all([
        summaryRes.json(),
        revenueExpenseRes.json(),
        categorySalesRes.json(),
      ]);

      if (summaryData.success) {
        setSummary({
          revenue: Number(summaryData.data.revenue) || 0,
          expenses: Number(summaryData.data.expenses) || 0,
          profit: Number(summaryData.data.profit) || 0,
          transactions: Number(summaryData.data.transactions) || 0,
          period: summaryData.data.period || '',
        });
      }

      if (revenueExpenseData.success) {
        setRevenueExpense(revenueExpenseData.data.map((d: Record<string, unknown>) => ({
          month: (d.month || d.label) as string,
          revenue: Number(d.revenue) || 0,
          expense: Number(d.expense) || 0,
        })));
      }

      if (categorySalesData.success) {
        setCategorySales(categorySalesData.data.map((d: Record<string, unknown>) => ({
          jenis_produk: d.jenis_produk as string,
          percentage: Number(d.percentage) || 0,
          total: Number(d.total) || 0,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPeriodLabel = (): string => {
    switch (period) {
      case '7days':
        return '7 Hari Terakhir';
      case '30days':
        return '30 Hari Terakhir';
      case '3months':
        return '3 Bulan Terakhir';
      case '6months':
        return '6 Bulan Terakhir';
      case '1year':
      default:
        return '1 Tahun Terakhir';
    }
  };

  const handleExport = () => {
    // Generate CSV content with semicolon delimiter for better Excel compatibility
    const periodLabel = getPeriodLabel();
    const today = new Date().toLocaleDateString('id-ID');
    
    let csvContent = '';
    
    // Header
    csvContent += `Laporan Cafe Merah Putih\n`;
    csvContent += `Periode;${periodLabel}\n`;
    csvContent += `Tanggal Export;${today}\n\n`;
    
    // Summary section
    csvContent += `RINGKASAN\n`;
    csvContent += `Keterangan;Nilai\n`;
    csvContent += `Total Pendapatan;${formatCurrency(summary?.revenue || 0)}\n`;
    csvContent += `Total Pengeluaran;${formatCurrency(summary?.expenses || 0)}\n`;
    csvContent += `Laba Bersih;${formatCurrency(summary?.profit || 0)}\n`;
    csvContent += `Total Transaksi;${summary?.transactions || 0}\n\n`;
    
    // Revenue vs Expense section
    csvContent += `PENDAPATAN VS PENGELUARAN\n`;
    csvContent += `Periode;Pendapatan;Pengeluaran\n`;
    revenueExpense.forEach(item => {
      csvContent += `${item.month};${formatCurrency(item.revenue)};${formatCurrency(item.expense)}\n`;
    });
    csvContent += `\n`;
    
    // Category Sales section
    csvContent += `PENJUALAN PER KATEGORI\n`;
    csvContent += `Kategori;Total;Persentase\n`;
    categorySales.forEach(item => {
      csvContent += `${item.jenis_produk};${formatCurrency(item.total)};${item.percentage.toFixed(1)}%\n`;
    });
    
    // Add BOM for UTF-8 encoding to support Indonesian characters in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan-cafe-${period}-${today.replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Memuat laporan...</p>
        </div>
      </div>
    );
  }

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
          value={formatCurrency(summary?.revenue || 0)}
          changeLabel={summary?.period || 'Periode ini'}
        />
        <ReportStatCard
          icon={<TrendingDown className="w-6 h-6 text-red-600" />}
          iconBgColor="bg-red-100"
          title="Total Pengeluaran"
          value={formatCurrency(summary?.expenses || 0)}
          changeLabel={summary?.period || 'Periode ini'}
        />
        <ReportStatCard
          icon={<Wallet className="w-6 h-6 text-blue-600" />}
          iconBgColor="bg-blue-100"
          title="Laba Bersih"
          value={formatCurrency(summary?.profit || 0)}
          changeLabel={summary?.period || 'Periode ini'}
        />
        <ReportStatCard
          icon={<ShoppingCart className="w-6 h-6 text-purple-600" />}
          iconBgColor="bg-purple-100"
          title="Total Transaksi"
          value={(summary?.transactions || 0).toLocaleString('id-ID')}
          changeLabel={summary?.period || 'Periode ini'}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueExpenseChart data={revenueExpense} />
        </div>
        <div>
          <CategorySalesChart data={categorySales} />
        </div>
      </div>
    </div>
  );
}
