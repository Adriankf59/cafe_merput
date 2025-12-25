'use client';

import React, { useState, useMemo } from 'react';
import { Product, ProductCategory } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Product, 'id' | 'status' | 'createdAt'>) => void;
  product?: Product | null;
}

const categories: ProductCategory[] = ['Kopi', 'Non-Kopi', 'Makanan'];

export function ProductForm({ isOpen, onClose, onSubmit, product }: ProductFormProps) {
  const isEditing = !!product;
  
  // Use key to reset form state when product changes
  const formKey = useMemo(() => product?.id || 'new', [product?.id]);
  
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState<ProductCategory>(product?.category || 'Kopi');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [stock, setStock] = useState(product?.stock?.toString() || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when product changes
  const resetForm = () => {
    setName(product?.name || '');
    setCategory(product?.category || 'Kopi');
    setPrice(product?.price?.toString() || '');
    setStock(product?.stock?.toString() || '');
    setErrors({});
  };

  // Reset when modal opens with different product
  useMemo(() => {
    if (isOpen) {
      resetForm();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, formKey]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nama produk wajib diisi';
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Harga harus berupa angka positif';
    }

    if (stock === '' || isNaN(Number(stock)) || Number(stock) < 0) {
      newErrors.stock = 'Stok harus berupa angka non-negatif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      category,
      price: Number(price),
      stock: Number(stock),
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Produk' : 'Tambah Produk'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Produk"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama produk"
          error={errors.name}
        />

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategori
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Harga (Rp)"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Masukkan harga"
          error={errors.price}
        />

        <Input
          label="Stok"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Masukkan jumlah stok"
          error={errors.stock}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit">
            {isEditing ? 'Simpan' : 'Tambah'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ProductForm;
