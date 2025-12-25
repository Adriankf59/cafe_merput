'use client';

import { AlertTriangle } from 'lucide-react';
import { Material } from '@/lib/types';

interface LowStockAlertProps {
  materials: Material[];
}

export function LowStockAlert({ materials }: LowStockAlertProps) {
  // Filter materials with low stock (stock < minStock)
  const lowStockMaterials = materials.filter((m) => m.stock < m.minStock);
  const lowStockCount = lowStockMaterials.length;

  if (lowStockCount === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Peringatan Stok Rendah
          </h3>
          <p className="mt-1 text-sm text-red-700">
            Terdapat <span className="font-semibold">{lowStockCount}</span> bahan baku dengan stok di bawah minimum:
          </p>
          <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
            {lowStockMaterials.map((material) => (
              <li key={material.id}>
                <span className="font-medium">{material.name}</span>
                {' - '}
                Stok: {material.stock} {material.unit} (Min: {material.minStock} {material.unit})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LowStockAlert;
