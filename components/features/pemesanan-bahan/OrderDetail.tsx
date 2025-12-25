'use client';

import { MaterialOrder } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, getStatusBadgeVariant } from '@/lib/services/orders';

interface OrderDetailProps {
  isOpen: boolean;
  onClose: () => void;
  order: MaterialOrder | null;
}

export function OrderDetail({ isOpen, onClose, order }: OrderDetailProps) {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Pesanan" className="max-w-2xl">
      <div className="space-y-6">
        {/* Order Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500">ID Pesanan</label>
            <p className="font-medium text-gray-900">{order.id}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500">Status</label>
            <Badge variant={getStatusBadgeVariant(order.status)}>
              {order.status}
            </Badge>
          </div>
          <div>
            <label className="block text-sm text-gray-500">Supplier</label>
            <p className="font-medium text-gray-900">{order.supplierName}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500">Tanggal Pesanan</label>
            <p className="font-medium text-gray-900">{formatDate(order.orderDate)}</p>
          </div>
        </div>

        {/* Items Table */}
        <div>
          <label className="block text-sm text-gray-500 mb-2">Item Pesanan</label>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bahan Baku
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Jumlah
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Harga
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.materialName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                    Total
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                    {formatCurrency(order.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Created At */}
        <div className="text-sm text-gray-500 pt-4 border-t">
          Dibuat pada: {formatDate(order.createdAt)}
        </div>
      </div>
    </Modal>
  );
}

export default OrderDetail;
