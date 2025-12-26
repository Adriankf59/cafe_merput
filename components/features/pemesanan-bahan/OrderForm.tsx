'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getMaterials } from '@/lib/services/materials';
import { createOrder } from '@/lib/services/orders';
import { useAuth } from '@/lib/context/AuthContext';
import { Material } from '@/lib/types';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function OrderForm({ isOpen, onClose, onSubmit }: OrderFormProps) {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [harga, setHarga] = useState('');
  const [tanggalPesan, setTanggalPesan] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchMaterials();
    }
  }, [isOpen]);

  const fetchMaterials = async () => {
    try {
      const data = await getMaterials();
      setMaterials(data);
      if (data.length > 0) {
        setSelectedMaterial(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    }
  };

  const selectedMaterialData = materials.find(m => m.id === selectedMaterial);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedMaterial) {
      newErrors.material = 'Bahan baku wajib dipilih';
    }

    if (!jumlah || Number(jumlah) <= 0) {
      newErrors.jumlah = 'Jumlah harus lebih dari 0';
    }

    if (!harga || Number(harga) <= 0) {
      newErrors.harga = 'Harga harus lebih dari 0';
    }

    if (!tanggalPesan) {
      newErrors.tanggalPesan = 'Tanggal pesanan wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !user) return;

    setIsLoading(true);
    try {
      const result = await createOrder({
        bahan_id: selectedMaterial,
        user_id: user.id,
        jumlah: Number(jumlah),
        harga: Number(harga),
        tanggal_pesan: new Date(tanggalPesan),
      });

      if (result) {
        // Reset form
        setJumlah('');
        setHarga('');
        setTanggalPesan(new Date().toISOString().split('T')[0]);
        onSubmit();
        onClose();
      } else {
        setErrors({ submit: 'Gagal membuat pesanan' });
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      setErrors({ submit: 'Terjadi kesalahan saat membuat pesanan' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setJumlah('');
    setHarga('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Buat Pesanan Bahan Baku">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bahan Baku
          </label>
          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
              errors.material ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          >
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.name} (Stok: {material.stock} {material.unit})
                {material.status === 'Stok Rendah' && ' ⚠️'}
              </option>
            ))}
          </select>
          {errors.material && (
            <p className="mt-1 text-sm text-red-600">{errors.material}</p>
          )}
        </div>

        {selectedMaterialData && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Stok saat ini: <span className="font-medium">{selectedMaterialData.stock} {selectedMaterialData.unit}</span>
            </p>
            <p className="text-sm text-gray-600">
              Stok minimum: <span className="font-medium">{selectedMaterialData.minStock} {selectedMaterialData.unit}</span>
            </p>
            <p className="text-sm text-gray-600">
              Status: <span className={`font-medium ${selectedMaterialData.status === 'Stok Rendah' ? 'text-red-600' : 'text-green-600'}`}>
                {selectedMaterialData.status}
              </span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label={`Jumlah (${selectedMaterialData?.unit || 'unit'})`}
              type="number"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              placeholder="Masukkan jumlah"
              min="1"
              error={errors.jumlah}
              disabled={isLoading}
            />
          </div>
          <div>
            <Input
              label="Harga Total (Rp)"
              type="number"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              placeholder="Masukkan harga"
              min="0"
              error={errors.harga}
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <Input
            label="Tanggal Pesanan"
            type="date"
            value={tanggalPesan}
            onChange={(e) => setTanggalPesan(e.target.value)}
            error={errors.tanggalPesan}
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Buat Pesanan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default OrderForm;
