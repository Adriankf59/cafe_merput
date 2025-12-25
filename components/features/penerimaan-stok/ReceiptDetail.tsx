'use client';

import { StockReceipt } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { formatDate, getReceiptStatusBadgeVariant } from '@/lib/services/receipts';

interface ReceiptDetailProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: StockReceipt | null;
}

export function ReceiptDetail({ isOpen, onClose, receipt }: ReceiptDetailProps) {
  if (!receipt) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Penerimaan Stok" className="max-w-2xl">
      <div className="space-y-6">
        {/* Receipt Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500">ID Penerimaan</label>
            <p className="font-medium text-gray-900">{receipt.id}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500">Status</label>
            <Badge variant={getReceiptStatusBadgeVariant(receipt.status)}>
              {receipt.status}
            </Badge>
          </div>
          <div>
            <label className="block text-sm text-gray-500">ID Pesanan</label>
            <p className="font-medium text-gray-900">{receipt.orderId}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500">Tanggal Penerimaan</label>
            <p className="font-medium text-gray-900">{formatDate(receipt.receiptDate)}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-500">Supplier</label>
            <p className="font-medium text-gray-900">{receipt.supplierName}</p>
          </div>
        </div>

        {/* Items Table */}
        <div>
          <label className="block text-sm text-gray-500 mb-2">Item Penerimaan</label>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bahan Baku
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Dipesan
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Diterima
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {receipt.items.map((item, index) => {
                  const isComplete = item.receivedQuantity >= item.orderedQuantity;
                  return (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.materialName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {item.orderedQuantity} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {item.receivedQuantity} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={isComplete ? 'success' : 'warning'}>
                          {isComplete ? 'Lengkap' : 'Sebagian'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Created At */}
        <div className="text-sm text-gray-500 pt-4 border-t">
          Dicatat pada: {formatDate(receipt.createdAt)}
        </div>
      </div>
    </Modal>
  );
}

export default ReceiptDetail;
