'use client';

import React from 'react';
import { Product } from '@/lib/types';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function ProductGrid({ products, onProductClick }: ProductGridProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryColor = (category: Product['category']) => {
    switch (category) {
      case 'Kopi':
        return 'bg-red-100 text-red-700';
      case 'Non-Kopi':
        return 'bg-blue-100 text-blue-700';
      case 'Makanan':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Tidak ada produk ditemukan
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => product.status === 'Tersedia' && onProductClick(product)}
          className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:border-red-300 bg-white rounded-lg border border-gray-200 shadow-sm ${
            product.status === 'Habis' ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                {product.name}
              </h3>
            </div>
            <span
              className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-2 ${getCategoryColor(
                product.category
              )}`}
            >
              {product.category}
            </span>
            <div className="flex items-center justify-between">
              <span className="text-red-600 font-semibold text-sm">
                {formatCurrency(product.price)}
              </span>
              {product.status === 'Habis' && (
                <span className="text-xs text-red-500 font-medium">Habis</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductGrid;
