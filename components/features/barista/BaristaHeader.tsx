'use client';

import { Coffee, RefreshCw, LogOut } from 'lucide-react';

interface BaristaHeaderProps {
  activeOrdersCount: number;
  onRefresh?: () => void;
  onSignOut?: () => void;
}

export function BaristaHeader({ activeOrdersCount, onRefresh, onSignOut }: BaristaHeaderProps) {
  return (
    <header className="bg-primary text-white">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <Coffee className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold">Caffe Merah Putih</h1>
            <p className="text-sm text-white/80">Dashboard Barista</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-white/80">Pesanan Aktif</p>
            <p className="text-2xl font-bold">{activeOrdersCount}</p>
          </div>
          <button
            onClick={onRefresh}
            className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            title="Sign Out"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default BaristaHeader;
