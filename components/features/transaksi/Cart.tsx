'use client';

import React from 'react';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { CartItem } from '@/lib/types';
import { Card, Button } from '@/components/ui';

interface CartProps {
  items: CartItem[];
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onCheckout: () => void;
}

export function Cart({
  items,
  onRemoveItem,
  onUpdateQuantity,
  onCheckout,
}: CartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  const handleIncrement = (productId: string, currentQty: number) => {
    onUpdateQuantity(productId, currentQty + 1);
  };

  const handleDecrement = (productId: string, currentQty: number) => {
    if (currentQty > 1) {
      onUpdateQuantity(productId, currentQty - 1);
    } else {
      onRemoveItem(productId);
    }
  };

  return (
    <Card padding="none" className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-red-600" />
          <h2 className="font-semibold text-gray-900">Keranjang</h2>
          {items.length > 0 && (
            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <ShoppingCart className="h-12 w-12 mb-2" />
            <p className="text-sm">Keranjang kosong</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {item.productName}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(item.price)} x {item.quantity}
                  </p>
                  <p className="text-sm font-semibold text-red-600 mt-1">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDecrement(item.productId, item.quantity)}
                    className="p-1 rounded-md hover:bg-gray-200 text-gray-600"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleIncrement(item.productId, item.quantity)}
                    className="p-1 rounded-md hover:bg-gray-200 text-gray-600"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onRemoveItem(item.productId)}
                    className="p-1 rounded-md hover:bg-red-100 text-red-600 ml-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-4 space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Pajak (10%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 text-base pt-2 border-t">
            <span>Total</span>
            <span className="text-red-600">{formatCurrency(total)}</span>
          </div>
        </div>
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={items.length === 0}
          onClick={onCheckout}
        >
          Bayar Sekarang
        </Button>
      </div>
    </Card>
  );
}

export default Cart;
