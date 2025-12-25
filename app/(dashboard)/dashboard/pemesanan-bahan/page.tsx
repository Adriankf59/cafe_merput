'use client';

import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { MaterialOrder } from '@/lib/types';
import {
  getOrders,
  searchOrders,
  createOrder,
} from '@/lib/services/orders';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Card } from '@/components/ui/Card';
import { OrdersTable } from '@/components/features/pemesanan-bahan/OrdersTable';
import { OrderForm } from '@/components/features/pemesanan-bahan/OrderForm';
import { OrderDetail } from '@/components/features/pemesanan-bahan/OrderDetail';

export default function PemesananBahanPage() {
  const [orders, setOrders] = useState<MaterialOrder[]>(() => getOrders());
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<MaterialOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const refreshOrders = useCallback(() => {
    setOrders(getOrders());
  }, []);

  // Apply search filter
  const filteredOrders = searchOrders(orders, searchQuery);

  const handleCreateOrder = () => {
    setIsFormOpen(true);
  };

  const handleViewDetail = (order: MaterialOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleFormSubmit = (data: Omit<MaterialOrder, 'id' | 'total' | 'createdAt'>) => {
    createOrder(data);
    refreshOrders();
    setIsFormOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pemesanan Bahan</h1>
        <Button onClick={handleCreateOrder} icon={<Plus className="h-4 w-4" />}>
          Buat Pesanan
        </Button>
      </div>

      <Card>
        {/* Search */}
        <div className="mb-6">
          <SearchInput
            placeholder="Cari berdasarkan ID atau supplier..."
            value={searchQuery}
            onSearch={setSearchQuery}
            className="max-w-md"
          />
        </div>

        {/* Orders Table */}
        <OrdersTable
          orders={filteredOrders}
          onViewDetail={handleViewDetail}
        />
      </Card>

      {/* Create Order Form Modal */}
      <OrderForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Order Detail Modal */}
      <OrderDetail
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
    </div>
  );
}
