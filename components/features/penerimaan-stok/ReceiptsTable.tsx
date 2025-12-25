'use client';

import { Eye } from 'lucide-react';
import { StockReceipt } from '@/lib/types';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, getReceiptStatusBadgeVariant } from '@/lib/services/receipts';

interface ReceiptsTableProps {
  receipts: StockReceipt[];
  onViewDetail: (receipt: StockReceipt) => void;
}

export function ReceiptsTable({ receipts, onViewDetail }: ReceiptsTableProps) {
  const columns = [
    {
      key: 'id',
      header: 'ID Penerimaan',
      render: (receipt: StockReceipt) => (
        <span className="font-medium text-gray-900">{receipt.id}</span>
      ),
    },
    {
      key: 'receiptDate',
      header: 'Tanggal',
      render: (receipt: StockReceipt) => (
        <span>{formatDate(receipt.receiptDate)}</span>
      ),
    },
    {
      key: 'orderId',
      header: 'ID Pesanan',
      render: (receipt: StockReceipt) => (
        <span className="text-gray-600">{receipt.orderId}</span>
      ),
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      render: (receipt: StockReceipt) => (
        <span>{receipt.supplierName}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (receipt: StockReceipt) => (
        <Badge variant={getReceiptStatusBadgeVariant(receipt.status)}>
          {receipt.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Detail',
      render: (receipt: StockReceipt) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail(receipt);
          }}
          icon={<Eye className="h-4 w-4" />}
        >
          Lihat Detail
        </Button>
      ),
    },
  ];

  return <Table columns={columns} data={receipts} />;
}

export default ReceiptsTable;
