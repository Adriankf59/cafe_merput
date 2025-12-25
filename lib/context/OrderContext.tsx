'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { BaristaOrder, BaristaOrderStatus, BaristaOrderItem } from '@/lib/types';
import { getAuthToken } from '@/lib/services/auth';

interface OrderContextType {
  orders: BaristaOrder[];
  isLoading: boolean;
  addOrder: (items: BaristaOrderItem[], cashierId: string, cashierName: string, transactionId?: string) => Promise<BaristaOrder>;
  updateOrderStatus: (orderId: string, status: BaristaOrderStatus) => Promise<void>;
  getOrdersByStatus: (status: BaristaOrderStatus | 'all') => BaristaOrder[];
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

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

// Map API response to BaristaOrder type
function mapApiOrder(apiOrder: Record<string, unknown>): BaristaOrder {
  const items = (apiOrder.items as Array<Record<string, unknown>> || []).map((item) => ({
    productId: item.produk_id as string,
    productName: item.nama_produk as string || '',
    quantity: Number(item.jumlah),
    notes: item.notes as string | undefined,
  }));

  return {
    id: apiOrder.order_id as string,
    orderNumber: apiOrder.order_number as string,
    items,
    status: apiOrder.status as BaristaOrderStatus,
    createdAt: new Date(apiOrder.created_at as string),
    cashierId: apiOrder.cashier_id as string,
    cashierName: apiOrder.cashier_name as string || 'Unknown',
  };
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<BaristaOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/barista-orders?status=active', {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setOrders(data.data.map(mapApiOrder));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Poll for new orders every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const addOrder = useCallback(async (
    items: BaristaOrderItem[], 
    cashierId: string, 
    cashierName: string,
    transactionId?: string
  ): Promise<BaristaOrder> => {
    const response = await fetch('/api/barista-orders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        cashier_id: cashierId,
        transaksi_id: transactionId,
        items: items.map((item) => ({
          produk_id: item.productId,
          jumlah: item.quantity,
          notes: item.notes,
        })),
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to create order');
    }

    const newOrder = mapApiOrder(data.data);
    setOrders((prev) => [newOrder, ...prev]);
    
    return newOrder;
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: BaristaOrderStatus) => {
    const response = await fetch(`/api/barista-orders/${orderId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to update order status');
    }

    // Update local state
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ).filter((order) => order.status !== 'completed')
    );
  }, []);

  const getOrdersByStatus = useCallback((status: BaristaOrderStatus | 'all'): BaristaOrder[] => {
    if (status === 'all') {
      return orders.filter((o) => o.status !== 'completed');
    }
    return orders.filter((order) => order.status === status);
  }, [orders]);

  const refreshOrders = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  const value: OrderContextType = {
    orders,
    isLoading,
    addOrder,
    updateOrderStatus,
    getOrdersByStatus,
    refreshOrders,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
