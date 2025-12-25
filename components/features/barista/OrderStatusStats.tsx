'use client';

import { Clock, ChefHat, CheckCircle } from 'lucide-react';

interface OrderStats {
  waiting: number;
  processing: number;
  ready: number;
}

interface OrderStatusStatsProps {
  stats: OrderStats;
}

export function OrderStatusStats({ stats }: OrderStatusStatsProps) {
  return (
    <div className="flex items-center gap-8 px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
          <Clock className="text-yellow-600" size={16} />
        </div>
        <div>
          <p className="text-xs text-gray-500">Menunggu</p>
          <p className="text-lg font-bold text-gray-900">{stats.waiting}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <ChefHat className="text-blue-600" size={16} />
        </div>
        <div>
          <p className="text-xs text-gray-500">Diproses</p>
          <p className="text-lg font-bold text-gray-900">{stats.processing}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="text-green-600" size={16} />
        </div>
        <div>
          <p className="text-xs text-gray-500">Siap</p>
          <p className="text-lg font-bold text-gray-900">{stats.ready}</p>
        </div>
      </div>
    </div>
  );
}

export default OrderStatusStats;
