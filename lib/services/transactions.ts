// Transactions service for Cafe Merah Putih Management System
// Handles transaction operations via API endpoints

import { Transaction, CartItem } from '../types';
import { getAuthToken } from './auth';
import { calculateCartTotals } from './cart';

// Helper to get auth headers
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Map API response to Transaction type
function mapApiTransaction(apiTransaction: Record<string, unknown>): Transaction {
  const total = Number(apiTransaction.total_harga || 0);
  const tax = total * 0.1 / 1.1; // Extract tax from total (assuming 10% tax included)
  const subtotal = total - tax;
  
  // Map items if available
  const items: CartItem[] = [];
  if (apiTransaction.items && Array.isArray(apiTransaction.items)) {
    for (const item of apiTransaction.items as Array<Record<string, unknown>>) {
      items.push({
        productId: item.produk_id as string,
        productName: item.nama_produk as string || '',
        price: Number(item.harga || 0),
        quantity: Number(item.jumlah || 0),
        subtotal: Number(item.harga || 0) * Number(item.jumlah || 0),
      });
    }
  }

  return {
    id: apiTransaction.transaksi_id as string,
    items,
    subtotal,
    tax,
    total,
    paymentMethod: 'Cash', // API doesn't store payment method
    cashierId: apiTransaction.user_id as string,
    createdAt: new Date(apiTransaction.tanggal as string || apiTransaction.created_at as string),
  };
}

// Get all transactions
export async function getTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]> {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate.toISOString().split('T')[0]);
    if (endDate) params.append('end_date', endDate.toISOString().split('T')[0]);
    
    const url = `/api/transactions${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.error('Failed to fetch transactions:', data.error);
      return [];
    }

    return data.data.map(mapApiTransaction);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

// Get transaction by ID
export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  try {
    const response = await fetch(`/api/transactions/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return undefined;
    }

    return mapApiTransaction(data.data);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return undefined;
  }
}

// Create new transaction
export async function createTransaction(
  items: CartItem[],
  cashierId: string,
  paymentMethod: string = 'Cash'
): Promise<Transaction | null> {
  try {
    const { total } = calculateCartTotals(items);
    
    // Map items to API format
    const apiItems = items.map(item => ({
      produk_id: item.productId,
      jumlah: item.quantity,
    }));

    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        user_id: cashierId,
        total_harga: total,
        items: apiItems,
      }),
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      console.error('Failed to create transaction:', result.error);
      return null;
    }

    // Return the created transaction with original items
    const { subtotal, tax } = calculateCartTotals(items);
    return {
      id: result.data.transaksi_id,
      items: [...items],
      subtotal,
      tax,
      total,
      paymentMethod,
      cashierId,
      createdAt: new Date(result.data.tanggal || result.data.created_at),
    };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return null;
  }
}

// Get today's transactions
export async function getTodayTransactions(): Promise<Transaction[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return getTransactions(today, tomorrow);
}

// Get transactions by date range
export async function getTransactionsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Transaction[]> {
  return getTransactions(startDate, endDate);
}

// Calculate total sales from transactions (client-side for already fetched transactions)
export function calculateTotalSales(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.total, 0);
}
