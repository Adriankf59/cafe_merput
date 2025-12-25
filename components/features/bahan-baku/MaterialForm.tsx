'use client';

import { useState, useMemo } from 'react';
import { Material, MaterialCategory, MaterialUnit } from '@/lib/types';
import { mockSuppliers } from '@/lib/data/mockData';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface MaterialFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Material, 'id' | 'status' | 'createdAt'>) => void;
  material?: Material | null;
}

const categories: MaterialCategory[] = ['Kopi', 'Dairy', 'Pemanis', 'Lainnya'];
const units: MaterialUnit[] = ['kg', 'liter', 'pcs'];

export function MaterialForm({ isOpen, onClose, onSubmit, material }: MaterialFormProps) {
  const isEditing = !!material;
  
  // Use key to reset form state when material changes
  const formKey = useMemo(() => material?.id || 'new', [material?.id]);
  
  const [name, setName] = useState(material?.name || '');
  const [category, setCategory] = useState<MaterialCategory>(material?.category || 'Kopi');
  const [stock, setStock] = useState(material?.stock?.toString() || '');
  const [unit, setUnit] = useState<MaterialUnit>(material?.unit || 'kg');
  const [minStock, setMinStock] = useState(material?.minStock?.toString() || '');
  const [supplierId, setSupplierId] = useState(material?.supplierId || mockSuppliers[0]?.id || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when material changes
  const resetForm = () => {
    setName(material?.name || '');
    setCategory(material?.category || 'Kopi');
    setStock(material?.stock?.toString() || '');
    setUnit(material?.unit || 'kg');
    setMinStock(material?.minStock?.toString() || '');
    setSupplierId(material?.supplierId || mockSuppliers[0]?.id || '');
    setErrors({});
  };

  // Reset when modal opens with different material
  useMemo(() => {
    if (isOpen) {
      resetForm();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, formKey]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nama bahan baku wajib diisi';
    }

    if (stock === '' || isNaN(Number(stock)) || Number(stock) < 0) {
      newErrors.stock = 'Stok harus berupa angka non-negatif';
    }

    if (minStock === '' || isNaN(Number(minStock)) || Number(minStock) < 0) {
      newErrors.minStock = 'Minimum stok harus berupa angka non-negatif';
    }

    if (!supplierId) {
      newErrors.supplierId = 'Supplier wajib dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const selectedSupplier = mockSuppliers.find((s) => s.id === supplierId);

    onSubmit({
      name: name.trim(),
      category,
      stock: Number(stock),
      unit,
      minStock: Number(minStock),
      supplierId,
      supplierName: selectedSupplier?.name || '',
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Bahan Baku"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama bahan baku"
          error={errors.name}
        />

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategori
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as MaterialCategory)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Stok"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Jumlah stok"
            error={errors.stock}
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Satuan
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as MaterialUnit)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Minimum Stok"
          type="number"
          value={minStock}
          onChange={(e) => setMinStock(e.target.value)}
          placeholder="Batas minimum stok"
          error={errors.minStock}
        />

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supplier
          </label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
              errors.supplierId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Pilih Supplier</option>
            {mockSuppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
          {errors.supplierId && (
            <p className="mt-1 text-sm text-red-600">{errors.supplierId}</p>
          )}
        </div>

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

export default MaterialForm;
