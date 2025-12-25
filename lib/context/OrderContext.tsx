'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BaristaOrder, BaristaOrderStatus, BaristaOrderItem, Material } from '@/lib/types';
import { mockMaterials, mockProductMaterials } from '@/lib/data/mockData';

interface OrderContextType {
  orders: BaristaOrder[];
  materials: Material[];
  addOrder: (items: BaristaOrderItem[], cashierId: string, cashierName: string) => BaristaOrder;
  updateOrderStatus: (orderId: string, status: BaristaOrderStatus) => void;
  getOrdersByStatus: (status: BaristaOrderStatus | 'all') => BaristaOrder[];
  getMaterialById: (id: string) => Material | undefined;
  refreshOrders: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Generate order number
function generateOrderNumber(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${hours}${minutes}${random}`;
}

// Generate unique ID
function generateId(): string {
  return `ORD${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<BaristaOrder[]>([]);
  const [materials, setMaterials] = useState<Material[]>([...mockMaterials]);

  // Reduce material stock based on product materials composition
  const reduceMaterialStock = useCallback((items: BaristaOrderItem[]) => {
    setMaterials((prevMaterials) => {
      const updatedMaterials = [...prevMaterials];
      
      items.forEach((item) => {
        // Find all materials needed for this product
        const productMaterialsList = mockProductMaterials.filter(
          (pm) => pm.productId === item.productId
        );
        
        productMaterialsList.forEach((pm) => {
          const materialIndex = updatedMaterials.findIndex((m) => m.id === pm.materialId);
          if (materialIndex !== -1) {
            const material = updatedMaterials[materialIndex];
            const reduction = pm.quantity * item.quantity;
            const newStock = Math.max(0, material.stock - reduction);
            
            updatedMaterials[materialIndex] = {
              ...material,
              stock: Math.round(newStock * 1000) / 1000, // Round to 3 decimal places
              status: newStock <= material.minStock ? 'Stok Rendah' : 'Aman',
            };
          }
        });
      });
      
      return updatedMaterials;
    });
  }, []);

  const addOrder = useCallback((items: BaristaOrderItem[], cashierId: string, cashierName: string): BaristaOrder => {
    const newOrder: BaristaOrder = {
      id: generateId(),
      orderNumber: generateOrderNumber(),
      items,
      status: 'waiting',
      createdAt: new Date(),
      cashierId,
      cashierName,
    };

    setOrders((prev) => [newOrder, ...prev]);
    
    // Reduce material stock when order is created
    reduceMaterialStock(items);

    return newOrder;
  }, [reduceMaterialStock]);

  const updateOrderStatus = useCallback((orderId: string, status: BaristaOrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  }, []);

  const getOrdersByStatus = useCallback((status: BaristaOrderStatus | 'all'): BaristaOrder[] => {
    if (status === 'all') {
      return orders.filter((o) => o.status !== 'completed');
    }
    return orders.filter((order) => order.status === status);
  }, [orders]);

  const getMaterialById = useCallback((id: string): Material | undefined => {
    return materials.find((m) => m.id === id);
  }, [materials]);

  const refreshOrders = useCallback(() => {
    // In production, this would fetch from API
    console.log('Refreshing orders...');
  }, []);

  const value: OrderContextType = {
    orders,
    materials,
    addOrder,
    updateOrderStatus,
    getOrdersByStatus,
    getMaterialById,
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
