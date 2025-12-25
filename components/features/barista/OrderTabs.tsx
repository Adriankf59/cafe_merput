'use client';

import { Clock, ChefHat, CheckCircle, List } from 'lucide-react';

export type OrderTabType = 'all' | 'waiting' | 'processing' | 'ready';

interface OrderTabsProps {
  activeTab: OrderTabType;
  onTabChange: (tab: OrderTabType) => void;
  counts: {
    all: number;
    waiting: number;
    processing: number;
    ready: number;
  };
}

const tabs = [
  { id: 'all' as const, label: 'Semua', icon: List },
  { id: 'waiting' as const, label: 'Menunggu', icon: Clock },
  { id: 'processing' as const, label: 'Diproses', icon: ChefHat },
  { id: 'ready' as const, label: 'Siap', icon: CheckCircle },
];

export function OrderTabs({ activeTab, onTabChange, counts }: OrderTabsProps) {
  return (
    <div className="flex items-center gap-2 px-6 py-4 bg-white border-b border-gray-200">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const count = counts[tab.id];

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              isActive
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon size={16} />
            <span className="text-sm font-medium">{tab.label}</span>
            <span
              className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium flex items-center justify-center ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default OrderTabs;
