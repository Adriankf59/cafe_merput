// Orders service for Cafe Merah Putih Management System
// Handles CRUD operations for material orders (pemesanan bahan) via API endpoints

import { MaterialOrder, MaterialOrderItem, MaterialOrderStatus } from '../types';
import { getAuthToken } from './auth';

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

// Map API response to MaterialOrder type
function mapApiOrder(apiOrder: Record<string, unknown>): MaterialOrder {
  // Create a single item from the API order (API stores one material per order)
  const item: MaterialOrderItem = {
    materialId: apiOrder.bahan_id as string,
    materialName: apiOrder.nama_bahan as string || '',
    quantity: Number(apiOrder.jumlah || 0),
    unit: apiOrder.satuan as string || 'pcs',
    price: 0, // API doesn't store price per item
    subtotal: 0,
  };

  return {
    id: apiOrder.pengadaan_id as string,
    supplierId: '',
    supplierName: apiOrder.nama_bahan as string || 'Supplier', // Use material name as supplier for display
    items: [item],
    total: 0, // API doesn't store total
    status: apiOrder.status as MaterialOrderStatus,
    orderDate: new Date(apiOrder.tanggal_pesan as string),
    createdAt: new Date(apiOrder.created_at as string),
  };
}

// Get all orders
export async function getOrders(search?: string): Promise<MaterialOrder[]> {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const url = `/api/orders${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.error('Failed to fetch orders:', data.error);
      return [];
    }

    return data.data.map(mapApiOrder);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

// Get order by ID
export async function getOrderById(id: string): Promise<MaterialOrder | undefined> {
  try {
    const response = await fetch(`/api/orders/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return undefined;
    }

    return mapApiOrder(data.data);
  } catch (error) {
    console.error('Error fetching order:', error);
    return undefined;
  }
}

// Search orders by ID or supplier name (client-side filtering for already fetched orders)
export function searchOrders(orders: MaterialOrder[], query: string): MaterialOrder[] {
  if (!query.trim()) return orders;
  const lowerQuery = query.toLowerCase();
  return orders.filter(
    (o) =>
      o.id.toLowerCase().includes(lowerQuery) ||
      o.supplierName.toLowerCase().includes(lowerQuery)
  );
}

// Filter orders by status (client-side filtering)
export function filterOrdersByStatus(
  orders: MaterialOrder[],
  status: MaterialOrderStatus | 'Semua'
): MaterialOrder[] {
  if (status === 'Semua') return orders;
  return orders.filter((o) => o.status === status);
}

// Calculate order total from items
export function calculateOrderTotal(items: MaterialOrderItem[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}

// Create new order
export async function createOrder(
  data: {
    bahan_id: string;
    user_id: string;
    jumlah: number;
    harga?: number;
    tanggal_pesan?: Date;
  }
): Promise<MaterialOrder | null> {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        bahan_id: data.bahan_id,
        user_id: data.user_id,
        jumlah: data.jumlah,
        harga: data.harga || 0,
        tanggal_pesan: data.tanggal_pesan?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      }),
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      console.error('Failed to create order:', result.error);
      return null;
    }

    return mapApiOrder(result.data);
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
}

// Update order status
export async function updateOrderStatus(
  id: string,
  status: MaterialOrderStatus,
  tanggalTerima?: Date
): Promise<MaterialOrder | null> {
  try {
    const updateData: Record<string, unknown> = { status };
    if (tanggalTerima) {
      updateData.tanggal_terima = tanggalTerima.toISOString().split('T')[0];
    }

    const response = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      console.error('Failed to update order status:', result.error);
      return null;
    }

    return mapApiOrder(result.data);
  } catch (error) {
    console.error('Error updating order status:', error);
    return null;
  }
}

// Update existing order (alias for updateOrderStatus for compatibility)
export async function updateOrder(
  id: string,
  data: Partial<{ status: MaterialOrderStatus; tanggal_terima: Date }>
): Promise<MaterialOrder | null> {
  return updateOrderStatus(id, data.status || 'Pending', data.tanggal_terima);
}

// Delete order (not supported by API, return false)
export async function deleteOrder(id: string): Promise<boolean> {
  console.warn('Delete order not supported by API:', id);
  return false;
}

// Get suppliers list (mock data since API doesn't have suppliers endpoint)
export function getSuppliers() {
  return [
    { id: 'SUP001', name: 'PT Kopi Nusantara', contact: '021-1234567', email: 'info@kopinusantara.com', address: 'Jakarta' },
    { id: 'SUP002', name: 'CV Dairy Fresh', contact: '021-7654321', email: 'order@dairyfresh.com', address: 'Bandung' },
    { id: 'SUP003', name: 'UD Gula Manis', contact: '021-9876543', email: 'sales@gulamanis.com', address: 'Surabaya' },
  ];
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
