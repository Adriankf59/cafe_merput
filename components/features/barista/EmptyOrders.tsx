'use client';

import { Coffee } from 'lucide-react';

interface EmptyOrdersProps {
  message?: string;
  description?: string;
}

export function EmptyOrders({ 
  message = 'Tidak ada pesanan',
  description = 'Belum ada pesanan yang masuk'
}: EmptyOrdersProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Coffee size={40} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{message}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

export default EmptyOrders;
