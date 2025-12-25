// Transactions service for Cafe Merah Putih Management System
// Handles transaction persistence with local storage

import { Transaction, CartItem } from '../types';
import { mockTransactions } from '../data/mockData';
import { calculateCartTotals } from './cart';

const STORAGE_KEY = 'cafe_merah_putih_transactions';

// Initialize transactions from local storage or mock data
function initializeTransactions(): Transaction[] {
  if (typeof window === 'undefined') return mockTransactions;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const transactions = JSON.parse(stored);
    return transactions.map((t: Transaction) => ({
      ...t,
      createdAt: new Date(t.createdAt),
    }));
  }

  // Initialize with mock data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTransactions));
  return mockTransactions;
}

// Save transactions to local storage
function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// Generate new transaction ID
function generateTransactionId(): string {
  const transactions = initializeTransactions();
  const maxId = transactions.reduce((max, t) => {
    const num = parseInt(t.id.replace('TRX', ''), 10);
    return num > max ? num : max;
  }, 0);
  return `TRX${String(maxId + 1).padStart(3, '0')}`;
}

// Get all transactions
export function getTransactions(): Transaction[] {
  return initializeTransactions();
}

// Get transaction by ID
export function getTransactionById(id: string): Transaction | undefined {
  const transactions = initializeTransactions();
  return transactions.find((t) => t.id === id);
}

// Create new transaction
export function createTransaction(
  items: CartItem[],
  cashierId: string,
  paymentMethod: string = 'Cash'
): Transaction {
  const transactions = initializeTransactions();
  const { subtotal, tax, total } = calculateCartTotals(items);

  const newTransaction: Transaction = {
    id: generateTransactionId(),
    items: [...items],
    subtotal,
    tax,
    total,
    paymentMethod,
    cashierId,
    createdAt: new Date(),
  };

  transactions.push(newTransaction);
  saveTransactions(transactions);
  return newTransaction;
}

// Get today's transactions
export function getTodayTransactions(): Transaction[] {
  const transactions = initializeTransactions();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return transactions.filter((t) => {
    const transactionDate = new Date(t.createdAt);
    transactionDate.setHours(0, 0, 0, 0);
    return transactionDate.getTime() === today.getTime();
  });
}

// Get transactions by date range
export function getTransactionsByDateRange(
  startDate: Date,
  endDate: Date
): Transaction[] {
  const transactions = initializeTransactions();
  return transactions.filter((t) => {
    const transactionDate = new Date(t.createdAt);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
}

// Calculate total sales from transactions
export function calculateTotalSales(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.total, 0);
}
