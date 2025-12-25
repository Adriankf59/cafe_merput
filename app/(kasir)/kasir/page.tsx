'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ProductGrid, Cart } from '@/components/features/transaksi';
import { SearchInput, Button } from '@/components/ui';
import { Product, CartItem, ProductCategory, BaristaOrderItem } from '@/lib/types';
import { getProducts, searchProducts, filterProductsByCategory } from '@/lib/services/products';
import { addItemToCart, removeItemFromCart, updateItemQuantity, clearCart } from '@/lib/services/cart';
import { createTransaction } from '@/lib/services/transactions';
import { useAuth } from '@/lib/context/AuthContext';
import { useOrders } from '@/lib/context/OrderContext';

const categories: (ProductCategory | 'Semua')[] = ['Semua', 'Kopi', 'Non-Kopi', 'Makanan'];

export default function KasirTransaksiPage() {
  const { user } = useAuth();
  const { addOrder } = useOrders();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'Semua'>('Semua');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products on mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

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
      
      // Convert cart items to barista order items
      const baristaItems: BaristaOrderItem[] = cartItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
      }));
      
      // Send order to barista
      const order = addOrder(baristaItems, user.id, user.name);
      
      // Clear cart after successful transaction
      setCartItems(clearCart());
      
      // Show success message
      alert(`Transaksi berhasil! Pesanan #${order.orderNumber} telah dikirim ke Barista.`);
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
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500">Memuat produk...</p>
              </div>
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              onProductClick={handleProductClick}
            />
          )}
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
