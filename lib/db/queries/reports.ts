import { query } from '../connection';
import { RowDataPacket } from 'mysql2/promise';

// Report summary interface
export interface ReportSummary {
  revenue: number;
  expenses: number;
  profit: number;
  transactions: number;
  period: string;
}

// Revenue vs expense data interface
export interface RevenueExpenseData {
  month: string;
  revenue: number;
  expense: number;
}

// Category sales data interface
export interface CategorySalesData {
  jenis_produk: string;
  percentage: number;
  total: number;
}

interface RevenueExpenseRow extends RowDataPacket, RevenueExpenseData {}
interface CategorySalesRow extends RowDataPacket {
  jenis_produk: string;
  total: number;
}

/**
 * Get report summary for a specific period
 */
export async function getSummary(period: 'daily' | 'weekly' | 'monthly'): Promise<ReportSummary> {
  let dateCondition: string;
  let periodLabel: string;

  switch (period) {
    case 'daily':
      dateCondition = 'DATE(tanggal) = CURDATE()';
      periodLabel = 'Hari Ini';
      break;
    case 'weekly':
      dateCondition = 'tanggal >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
      periodLabel = 'Minggu Ini';
      break;
    case 'monthly':
      dateCondition = 'MONTH(tanggal) = MONTH(CURDATE()) AND YEAR(tanggal) = YEAR(CURDATE())';
      periodLabel = 'Bulan Ini';
      break;
    default:
      dateCondition = 'DATE(tanggal) = CURDATE()';
      periodLabel = 'Hari Ini';
  }

  // Get revenue from transactions
  const revenueSql = `
    SELECT COALESCE(SUM(total_harga), 0) as revenue, COUNT(*) as transactions
    FROM transactions
    WHERE ${dateCondition}
  `;
  const revenueRows = await query<(RowDataPacket & { revenue: number; transactions: number })[]>(revenueSql);

  // Get expenses from material orders (received orders)
  let expenseDateCondition: string;
  switch (period) {
    case 'daily':
      expenseDateCondition = 'DATE(tanggal_terima) = CURDATE()';
      break;
    case 'weekly':
      expenseDateCondition = 'tanggal_terima >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
      break;
    case 'monthly':
      expenseDateCondition = 'MONTH(tanggal_terima) = MONTH(CURDATE()) AND YEAR(tanggal_terima) = YEAR(CURDATE())';
      break;
    default:
      expenseDateCondition = 'DATE(tanggal_terima) = CURDATE()';
  }

  // Note: In a real system, you'd have a price field in material_orders
  // For now, we'll estimate expenses based on order quantity
  const expensesSql = `
    SELECT COALESCE(SUM(jumlah * 10000), 0) as expenses
    FROM material_orders
    WHERE status = 'Diterima' AND ${expenseDateCondition}
  `;
  const expensesRows = await query<(RowDataPacket & { expenses: number })[]>(expensesSql);

  const revenue = revenueRows[0].revenue;
  const expenses = expensesRows[0].expenses;
  const profit = revenue - expenses;
  const transactions = revenueRows[0].transactions;

  return {
    revenue,
    expenses,
    profit,
    transactions,
    period: periodLabel
  };
}

/**
 * Get revenue vs expense data for the last N months
 */
export async function getRevenueExpense(months: number = 6): Promise<RevenueExpenseData[]> {
  // Get revenue by month
  const revenueSql = `
    SELECT 
      DATE_FORMAT(tanggal, '%b') as month,
      DATE_FORMAT(tanggal, '%Y-%m') as yearMonth,
      COALESCE(SUM(total_harga), 0) as revenue
    FROM transactions
    WHERE tanggal >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
    GROUP BY DATE_FORMAT(tanggal, '%Y-%m'), DATE_FORMAT(tanggal, '%b')
    ORDER BY yearMonth ASC
  `;
  const revenueRows = await query<(RowDataPacket & { month: string; yearMonth: string; revenue: number })[]>(
    revenueSql, 
    [months]
  );

  // Get expenses by month (from received material orders)
  const expenseSql = `
    SELECT 
      DATE_FORMAT(tanggal_terima, '%b') as month,
      DATE_FORMAT(tanggal_terima, '%Y-%m') as yearMonth,
      COALESCE(SUM(jumlah * 10000), 0) as expense
    FROM material_orders
    WHERE status = 'Diterima' AND tanggal_terima >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
    GROUP BY DATE_FORMAT(tanggal_terima, '%Y-%m'), DATE_FORMAT(tanggal_terima, '%b')
    ORDER BY yearMonth ASC
  `;
  const expenseRows = await query<(RowDataPacket & { month: string; yearMonth: string; expense: number })[]>(
    expenseSql, 
    [months]
  );

  // Combine revenue and expense data
  const monthsData = new Map<string, RevenueExpenseData>();

  // Initialize with last N months
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleString('en-US', { month: 'short' });
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthsData.set(yearMonth, { month: monthName, revenue: 0, expense: 0 });
  }

  // Fill in revenue data
  for (const row of revenueRows) {
    const existing = monthsData.get(row.yearMonth);
    if (existing) {
      existing.revenue = row.revenue;
    }
  }

  // Fill in expense data
  for (const row of expenseRows) {
    const existing = monthsData.get(row.yearMonth);
    if (existing) {
      existing.expense = row.expense;
    }
  }

  return Array.from(monthsData.values());
}

/**
 * Get sales by product category (jenis_produk)
 */
export async function getCategorySales(): Promise<CategorySalesData[]> {
  const sql = `
    SELECT 
      p.jenis_produk,
      COALESCE(SUM(ti.jumlah * p.harga), 0) as total
    FROM products p
    LEFT JOIN transaction_items ti ON p.produk_id = ti.produk_id
    LEFT JOIN transactions t ON ti.transaksi_id = t.transaksi_id
    WHERE t.tanggal >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) OR t.tanggal IS NULL
    GROUP BY p.jenis_produk
    ORDER BY total DESC
  `;
  const rows = await query<CategorySalesRow[]>(sql);

  // Calculate total for percentage
  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);

  return rows.map(row => ({
    jenis_produk: row.jenis_produk,
    total: row.total,
    percentage: grandTotal > 0 ? (row.total / grandTotal) * 100 : 0
  }));
}

/**
 * Get monthly revenue trend
 */
export async function getMonthlyRevenueTrend(months: number = 12): Promise<{ month: string; revenue: number }[]> {
  const sql = `
    SELECT 
      DATE_FORMAT(tanggal, '%b %Y') as month,
      COALESCE(SUM(total_harga), 0) as revenue
    FROM transactions
    WHERE tanggal >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
    GROUP BY DATE_FORMAT(tanggal, '%Y-%m'), DATE_FORMAT(tanggal, '%b %Y')
    ORDER BY DATE_FORMAT(tanggal, '%Y-%m') ASC
  `;
  const rows = await query<(RowDataPacket & { month: string; revenue: number })[]>(sql, [months]);
  return rows;
}

/**
 * Get daily revenue for a specific month
 */
export async function getDailyRevenue(year: number, month: number): Promise<{ day: number; revenue: number }[]> {
  const sql = `
    SELECT 
      DAY(tanggal) as day,
      COALESCE(SUM(total_harga), 0) as revenue
    FROM transactions
    WHERE YEAR(tanggal) = ? AND MONTH(tanggal) = ?
    GROUP BY DAY(tanggal)
    ORDER BY day ASC
  `;
  const rows = await query<(RowDataPacket & { day: number; revenue: number })[]>(sql, [year, month]);
  return rows;
}
