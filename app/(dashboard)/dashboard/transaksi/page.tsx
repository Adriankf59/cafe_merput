'use client';

import React, { useState, useMemo } from 'react';
import { ProductGrid, Cart } from '@/components/features/transaksi';
import { SearchInput, Button } from '@/components/ui';
import { Product, CartItem, ProductCategory } from '@/lib/types';
import { getProducts, searchProducts, filterProductsByCategory } from '@/lib/services/products';
import { addItemToCart, removeItemFromCart, updateItemQuantity, clearCart } from '@/lib/services/cart';
import { createTransaction } from '@/lib/services/transactions';
import { useAuth } from '@/lib/context/AuthContext';

const categories: (ProductCategory | 'Semua')[] = ['Semua', 'Kopi', 'Non-Kopi', 'Makanan'];

// Initialize products outside component to avoid effect
const initialProducts = typeof window !== 'undefined' ? getProducts() : [];

export default function TransaksiPage() {
  const { user } = useAuth();
  const [products] = useState<Product[]>(initialProducts);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'Semua'>('Semua');

  // Filter products using useMemo instead of useEffect
  const filteredProducts = useMemo(() => {
    let result = products;
    
    // Apply search filter
    if (searchQuery) {
      result = searchProducts(result, searchQuery);
    }
    
    // Apply category filter
    result = filterProductsByCategory(result, activeCategory);
    
    return result;
  }, [products, searchQuery, activeCategory]);

  const handleProductClick = (product: Product) => {
    if (product.status === 'Tersedia') {
      setCartItems((prev) => addItemToCart(prev, product));
    }
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => removeItemFromCart(prev, productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) => updateItemQuantity(prev, productId, quantity));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0 || !user) return;

    try {
      // Create transaction
      createTransaction(cartItems, user.id, 'Cash');
      
      // Clear cart after successful transaction
      setCartItems(clearCart());
      
      // Show success message (could use toast in production)
      alert('Transaksi berhasil!');
    } catch (error) {
      console.error('Failed to process transaction:', error);
      alert('Gagal memproses transaksi');
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleCategoryChange = (category: ProductCategory | 'Semua') => {
    setActiveCategory(category);
  };

  return (
    <div className="h-full flex gap-6">
      {/* Products Section */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Transaksi Penjualan</h1>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              placeholder="Cari produk..."
              value={searchQuery}
              onSearch={handleSearch}
              className="flex-1"
            />
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto">
          <ProductGrid
            products={filteredProducts}
            onProductClick={handleProductClick}
          />
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-80 flex-shrink-0">
        <Cart
          items={cartItems}
          onRemoveItem={handleRemoveItem}
          onUpdateQuantity={handleUpdateQuantity}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  );
}
