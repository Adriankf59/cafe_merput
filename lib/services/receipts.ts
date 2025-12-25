// Receipts service for Cafe Merah Putih Management System
// Handles CRUD operations for stock receipts (penerimaan stok) with local storage persistence

import { StockReceipt, StockReceiptItem, StockReceiptStatus } from '../types';
import { mockStockReceipts } from '../data/mockData';

const STORAGE_KEY = 'cafe_merah_putih_receipts';

// Initialize receipts from local storage or mock data
function initializeReceipts(): StockReceipt[] {
  if (typeof window === 'undefined') return mockStockReceipts;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const receipts = JSON.parse(stored);
    return receipts.map((r: StockReceipt) => ({
      ...r,
      receiptDate: new Date(r.receiptDate),
      createdAt: new Date(r.createdAt),
    }));
  }
  
  // Initialize with mock data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockStockReceipts));
  return mockStockReceipts;
}

// Save receipts to local storage
function saveReceipts(receipts: StockReceipt[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
}

// Get all receipts
export function getReceipts(): StockReceipt[] {
  return initializeReceipts();
}

// Get receipt by ID
export function getReceiptById(id: string): StockReceipt | undefined {
  const receipts = initializeReceipts();
  return receipts.find((r) => r.id === id);
}

// Search receipts by ID (case-insensitive)
export function searchReceipts(receipts: StockReceipt[], query: string): StockReceipt[] {
  if (!query.trim()) return receipts;
  const lowerQuery = query.toLowerCase();
  return receipts.filter(
    (r) =>
      r.id.toLowerCase().includes(lowerQuery) ||
      r.orderId.toLowerCase().includes(lowerQuery) ||
      r.supplierName.toLowerCase().includes(lowerQuery)
  );
}

// Filter receipts by status
export function filterReceiptsByStatus(
  receipts: StockReceipt[],
  status: StockReceiptStatus | 'Semua'
): StockReceipt[] {
  if (status === 'Semua') return receipts;
  return receipts.filter((r) => r.status === status);
}

// Generate new receipt ID
function generateReceiptId(): string {
  const receipts = initializeReceipts();
  const maxId = receipts.reduce((max, r) => {
    const num = parseInt(r.id.replace('RCP', ''), 10);
    return num > max ? num : max;
  }, 0);
  return `RCP${String(maxId + 1).padStart(3, '0')}`;
}

// Determine receipt status based on items
export function determineReceiptStatus(items: StockReceiptItem[]): StockReceiptStatus {
  const allComplete = items.every((item) => item.receivedQuantity >= item.orderedQuantity);
  return allComplete ? 'Lengkap' : 'Sebagian';
}

// Create new receipt
export function createReceipt(
  data: Omit<StockReceipt, 'id' | 'status' | 'createdAt'>
): StockReceipt {
  const receipts = initializeReceipts();
  const newReceipt: StockReceipt = {
    ...data,
    id: generateReceiptId(),
    status: determineReceiptStatus(data.items),
    createdAt: new Date(),
  };
  
  receipts.push(newReceipt);
  saveReceipts(receipts);
  return newReceipt;
}

// Update existing receipt
export function updateReceipt(
  id: string,
  data: Partial<Omit<StockReceipt, 'id' | 'createdAt'>>
): StockReceipt | null {
  const receipts = initializeReceipts();
  const index = receipts.findIndex((r) => r.id === id);
  
  if (index === -1) return null;
  
  const currentReceipt = receipts[index];
  const newItems = data.items ?? currentReceipt.items;
  
  const updatedReceipt: StockReceipt = {
    ...currentReceipt,
    ...data,
    status: determineReceiptStatus(newItems),
  };
  
  receipts[index] = updatedReceipt;
  saveReceipts(receipts);
  return updatedReceipt;
}

// Delete receipt
export function deleteReceipt(id: string): boolean {
  const receipts = initializeReceipts();
  const index = receipts.findIndex((r) => r.id === id);
  
  if (index === -1) return false;
  
  receipts.splice(index, 1);
  saveReceipts(receipts);
  return true;
}

// Get status badge variant
export function getReceiptStatusBadgeVariant(status: StockReceiptStatus): 'success' | 'warning' {
  switch (status) {
    case 'Lengkap':
      return 'success';
    case 'Sebagian':
      return 'warning';
    default:
      return 'warning';
  }
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

// Export types for convenience
export type { StockReceipt, StockReceiptItem, StockReceiptStatus };
