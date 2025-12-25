'use client';

import React from 'react';
import { Transaction } from '@/lib/types';
import { Modal, Card } from '@/components/ui';
import { Receipt, Calendar, User, CreditCard } from 'lucide-react';

interface TransactionDetailProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetail({ transaction, isOpen, onClose }: TransactionDetailProps) {
  if (!transaction) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Transaksi">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Receipt className="h-4 w-4" />
            <span className="text-sm">ID Transaksi:</span>
            <span className="font-mono font-medium text-gray-900">
              #{transaction.id.slice(-8).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Tanggal:</span>
            <span className="font-medium text-gray-900">
              {formatDate(transaction.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <CreditCard className="h-4 w-4" />
            <span className="text-sm">Metode Pembayaran:</span>
            <span className="font-medium text-gray-900">{transaction.paymentMethod}</span>
          </div>
        </div>

        {/* Items */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Item Pesanan</h4>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Produk
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                    Qty
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    Harga
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transaction.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.productName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{formatCurrency(transaction.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pajak (10%)</span>
            <span className="text-gray-900">{formatCurrency(transaction.tax)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
            <span className="text-gray-900">Total</span>
            <span className="text-green-600">{formatCurrency(transaction.total)}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default TransactionDetail;
