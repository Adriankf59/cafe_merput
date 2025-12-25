'use client';

import { Eye } from 'lucide-react';
import { MaterialOrder } from '@/lib/types';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, getStatusBadgeVariant } from '@/lib/services/orders';

interface OrdersTableProps {
  orders: MaterialOrder[];
  onViewDetail: (order: MaterialOrder) => void;
}

export function OrdersTable({ orders, onViewDetail }: OrdersTableProps) {
  const columns = [
    {
      key: 'id',
      header: 'ID Pesanan',
      render: (order: MaterialOrder) => (
        <span className="font-medium text-gray-900">{order.id}</span>
      ),
    },
    {
      key: 'orderDate',
      header: 'Tanggal',
      render: (order: MaterialOrder) => (
        <span>{formatDate(order.orderDate)}</span>
      ),
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      render: (order: MaterialOrder) => (
        <span>{order.supplierName}</span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (order: MaterialOrder) => (
        <span className="font-medium">{formatCurrency(order.total)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: MaterialOrder) => (
        <Badge variant={getStatusBadgeVariant(order.status)}>
          {order.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (order: MaterialOrder) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail(order);
          }}
          icon={<Eye className="h-4 w-4" />}
        >
          Detail
        </Button>
      ),
    },
  ];

  return <Table columns={columns} data={orders} />;
}

export default OrdersTable;
