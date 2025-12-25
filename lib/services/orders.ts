// Orders service for Cafe Merah Putih Management System
// Handles CRUD operations for material orders (pemesanan bahan) with local storage persistence

import { MaterialOrder, MaterialOrderItem, MaterialOrderStatus } from '../types';
import { mockMaterialOrders, mockSuppliers } from '../data/mockData';

const STORAGE_KEY = 'cafe_merah_putih_orders';

// Initialize orders from local storage or mock data
function initializeOrders(): MaterialOrder[] {
  if (typeof window === 'undefined') return mockMaterialOrders;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const orders = JSON.parse(stored);
    return orders.map((o: MaterialOrder) => ({
      ...o,
      orderDate: new Date(o.orderDate),
      createdAt: new Date(o.createdAt),
    }));
  }
  
  // Initialize with mock data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockMaterialOrders));
  return mockMaterialOrders;
}

// Save orders to local storage
function saveOrders(orders: MaterialOrder[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

// Get all orders
export function getOrders(): MaterialOrder[] {
  return initializeOrders();
}

// Get order by ID
export function getOrderById(id: string): MaterialOrder | undefined {
  const orders = initializeOrders();
  return orders.find((o) => o.id === id);
}

// Search orders by ID or supplier name (case-insensitive)
export function searchOrders(orders: MaterialOrder[], query: string): MaterialOrder[] {
  if (!query.trim()) return orders;
  const lowerQuery = query.toLowerCase();
  return orders.filter(
    (o) =>
      o.id.toLowerCase().includes(lowerQuery) ||
      o.supplierName.toLowerCase().includes(lowerQuery)
  );
}

// Filter orders by status
export function filterOrdersByStatus(
  orders: MaterialOrder[],
  status: MaterialOrderStatus | 'Semua'
): MaterialOrder[] {
  if (status === 'Semua') return orders;
  return orders.filter((o) => o.status === status);
}

// Generate new order ID
function generateOrderId(): string {
  const orders = initializeOrders();
  const maxId = orders.reduce((max, o) => {
    const num = parseInt(o.id.replace('ORD', ''), 10);
    return num > max ? num : max;
  }, 0);
  return `ORD${String(maxId + 1).padStart(3, '0')}`;
}

// Calculate order total from items
export function calculateOrderTotal(items: MaterialOrderItem[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}

// Create new order
export function createOrder(
  data: Omit<MaterialOrder, 'id' | 'total' | 'createdAt'>
): MaterialOrder {
  const orders = initializeOrders();
  const newOrder: MaterialOrder = {
    ...data,
    id: generateOrderId(),
    total: calculateOrderTotal(data.items),
    createdAt: new Date(),
  };
  
  orders.push(newOrder);
  saveOrders(orders);
  return newOrder;
}

// Update existing order
export function updateOrder(
  id: string,
  data: Partial<Omit<MaterialOrder, 'id' | 'createdAt'>>
): MaterialOrder | null {
  const orders = initializeOrders();
  const index = orders.findIndex((o) => o.id === id);
  
  if (index === -1) return null;
  
  const currentOrder = orders[index];
  const newItems = data.items ?? currentOrder.items;
  
  const updatedOrder: MaterialOrder = {
    ...currentOrder,
    ...data,
    total: calculateOrderTotal(newItems),
  };
  
  orders[index] = updatedOrder;
  saveOrders(orders);
  return updatedOrder;
}

// Update order status
export function updateOrderStatus(
  id: string,
  status: MaterialOrderStatus
): MaterialOrder | null {
  return updateOrder(id, { status });
}

// Delete order
export function deleteOrder(id: string): boolean {
  const orders = initializeOrders();
  const index = orders.findIndex((o) => o.id === id);
  
  if (index === -1) return false;
  
  orders.splice(index, 1);
  saveOrders(orders);
  return true;
}

// Get suppliers list
export function getSuppliers() {
  return mockSuppliers;
}

// Get status badge variant
export function getStatusBadgeVariant(status: MaterialOrderStatus): 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'Diterima':
      return 'success';
    case 'Dikirim':
      return 'warning';
    case 'Pending':
      return 'danger';
    default:
      return 'danger';
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
export type { MaterialOrder, MaterialOrderItem, MaterialOrderStatus };
