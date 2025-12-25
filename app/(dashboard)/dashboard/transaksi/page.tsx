'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ProductGrid, Cart, TransactionList, TransactionDetail } from '@/components/features/transaksi';
import { SearchInput, Button } from '@/components/ui';
import { Product, CartItem, ProductCategory, BaristaOrderItem, Transaction } from '@/lib/types';
import { getProducts, searchProducts, filterProductsByCategory } from '@/lib/services/products';
import { addItemToCart, removeItemFromCart, updateItemQuantity, clearCart } from '@/lib/services/cart';
import { createTransaction } from '@/lib/services/transactions';
import { useAuth } from '@/lib/context/AuthContext';
import { useOrders } from '@/lib/context/OrderContext';

const categories: (ProductCategory | 'Semua')[] = ['Semua', 'Kopi', 'Non-Kopi', 'Makanan'];

// Kasir View - Input transaksi
function KasirTransaksiView() {
  const { user } = useAuth();
  const { addOrder } = useOrders();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'Semua'>('Semua');
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredProducts = useMemo(() => {
    let result = products;
    if (searchQuery) {
      result = searchProducts(result, searchQuery);
    }
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

  const handleCheckout = async () => {
    if (cartItems.length === 0 || !user) return;

    try {
      const transaction = await createTransaction(cartItems, user.id, 'Cash');
      
      if (!transaction) {
        alert('Gagal membuat transaksi');
        return;
      }
      
      const baristaItems: BaristaOrderItem[] = cartItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
      }));
      
      const order = await addOrder(baristaItems, user.id, user.name, transaction.id);
      setCartItems(clearCart());
      
      const data = await getProducts();
      setProducts(data);
      
      alert(`Transaksi berhasil! Pesanan #${order.orderNumber} telah dikirim ke Barista.`);
    } catch (error) {
      console.error('Failed to process transaction:', error);
      alert('Gagal memproses transaksi');
    }
  };

  return (
    <div className="h-full flex gap-6">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Transaksi Penjualan</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              placeholder="Cari produk..."
              value={searchQuery}
              onSearch={setSearchQuery}
              className="flex-1"
            />
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500">Memuat produk...</p>
              </div>
            </div>
          ) : (
            <ProductGrid products={filteredProducts} onProductClick={handleProductClick} />
          )}
        </div>
      </div>

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

// Manager View - Rekap transaksi
function ManagerTransaksiView() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rekap Transaksi Penjualan</h1>
        <p className="text-gray-500 mt-1">Lihat semua transaksi yang dilakukan oleh kasir</p>
      </div>

      <TransactionList onViewDetail={handleViewDetail} />

      <TransactionDetail
        transaction={selectedTransaction}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}

export default function TransaksiPage() {
  const { user } = useAuth();

  // Manager dan Admin melihat rekap, Kasir melihat form input
  if (user?.role === 'Kasir') {
    return <KasirTransaksiView />;
  }

  return <ManagerTransaksiView />;
}
