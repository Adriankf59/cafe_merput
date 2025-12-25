'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { MaterialOrder, MaterialOrderItem, MaterialOrderStatus } from '@/lib/types';
import { mockSuppliers } from '@/lib/data/mockData';
import { getMaterials } from '@/lib/services/materials';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/services/orders';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<MaterialOrder, 'id' | 'total' | 'createdAt'>) => void;
}

const statuses: MaterialOrderStatus[] = ['Pending', 'Dikirim', 'Diterima'];

function OrderFormContent({ onClose, onSubmit }: Omit<OrderFormProps, 'isOpen'>) {
  const materials = getMaterials();
  
  const [supplierId, setSupplierId] = useState(mockSuppliers[0]?.id || '');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<MaterialOrderStatus>('Pending');
  const [items, setItems] = useState<MaterialOrderItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedSupplier = mockSuppliers.find((s) => s.id === supplierId);

  // Filter materials by selected supplier
  const supplierMaterials = materials.filter((m) => m.supplierId === supplierId);

  const addItem = () => {
    if (supplierMaterials.length === 0) return;
    
    const firstMaterial = supplierMaterials[0];
    const newItem: MaterialOrderItem = {
      materialId: firstMaterial.id,
      materialName: firstMaterial.name,
      quantity: 1,
      unit: firstMaterial.unit,
      price: 0,
      subtotal: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof MaterialOrderItem, value: string | number) => {
    const newItems = [...items];
    const item = newItems[index];
    
    if (field === 'materialId') {
      const material = materials.find((m) => m.id === value);
      if (material) {
        item.materialId = material.id;
        item.materialName = material.name;
        item.unit = material.unit;
      }
    } else if (field === 'quantity') {
      item.quantity = Number(value) || 0;
      item.subtotal = item.quantity * item.price;
    } else if (field === 'price') {
      item.price = Number(value) || 0;
      item.subtotal = item.quantity * item.price;
    }
    
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!supplierId) {
      newErrors.supplierId = 'Supplier wajib dipilih';
    }

    if (!orderDate) {
      newErrors.orderDate = 'Tanggal pesanan wajib diisi';
    }

    if (items.length === 0) {
      newErrors.items = 'Minimal satu item harus ditambahkan';
    }

    const invalidItems = items.some((item) => item.quantity <= 0 || item.price <= 0);
    if (invalidItems) {
      newErrors.items = 'Semua item harus memiliki jumlah dan harga yang valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      supplierId,
      supplierName: selectedSupplier?.name || '',
      items,
      status,
      orderDate: new Date(orderDate),
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supplier
          </label>
          <select
            value={supplierId}
            onChange={(e) => {
              setSupplierId(e.target.value);
              setItems([]); // Reset items when supplier changes
            }}
            className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
              errors.supplierId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
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

        <Input
          label="Tanggal Pesanan"
          type="date"
          value={orderDate}
          onChange={(e) => setOrderDate(e.target.value)}
          error={errors.orderDate}
        />
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as MaterialOrderStatus)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Items Section */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Item Pesanan
          </label>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addItem}
            icon={<Plus className="h-4 w-4" />}
            disabled={supplierMaterials.length === 0}
          >
            Tambah Item
          </Button>
        </div>

        {supplierMaterials.length === 0 && (
          <p className="text-sm text-gray-500 mb-3">
            Tidak ada bahan baku dari supplier ini.
          </p>
        )}

        {errors.items && (
          <p className="text-sm text-red-600 mb-3">{errors.items}</p>
        )}

        <div className="space-y-3 max-h-48 overflow-y-auto">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <select
                value={item.materialId}
                onChange={(e) => updateItem(index, 'materialId', e.target.value)}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
              >
                {supplierMaterials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                placeholder="Qty"
                min="1"
                className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
              <span className="text-sm text-gray-500 w-12">{item.unit}</span>
              <input
                type="number"
                value={item.price || ''}
                onChange={(e) => updateItem(index, 'price', e.target.value)}
                placeholder="Harga"
                min="0"
                className="w-28 px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
              <span className="text-sm font-medium w-28 text-right">
                {formatCurrency(item.subtotal)}
              </span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="flex justify-end mt-3 pt-3 border-t">
            <div className="text-right">
              <span className="text-sm text-gray-600">Total: </span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onClose}>
          Batal
        </Button>
        <Button type="submit">Buat Pesanan</Button>
      </div>
    </form>
  );
}

export function OrderForm({ isOpen, onClose, onSubmit }: OrderFormProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buat Pesanan Baru" className="max-w-2xl">
      {isOpen && <OrderFormContent onClose={onClose} onSubmit={onSubmit} />}
    </Modal>
  );
}

export default OrderForm;
