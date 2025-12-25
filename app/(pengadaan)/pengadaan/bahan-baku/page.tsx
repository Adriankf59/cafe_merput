'use client';

import { useState, useCallback, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Material } from '@/lib/types';
import {
  getMaterials,
  searchMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from '@/lib/services/materials';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Card } from '@/components/ui/Card';
import { MaterialTable } from '@/components/features/bahan-baku/MaterialTable';
import { MaterialForm } from '@/components/features/bahan-baku/MaterialForm';
import { LowStockAlert } from '@/components/features/bahan-baku/LowStockAlert';

export default function PengadaanBahanBakuPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Material | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMaterials = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getMaterials();
      setMaterials(data);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
      setMaterials([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMaterials();
  }, [refreshMaterials]);

  const filteredMaterials = searchMaterials(materials, searchQuery);

  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setIsFormOpen(true);
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setIsFormOpen(true);
  };

  const handleDeleteMaterial = (material: Material) => {
    setDeleteConfirm(material);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteMaterial(deleteConfirm.id);
      await refreshMaterials();
      setDeleteConfirm(null);
    }
  };

  const handleFormSubmit = async (data: Omit<Material, 'id' | 'status' | 'createdAt'>) => {
    if (editingMaterial) {
      await updateMaterial(editingMaterial.id, data);
    } else {
      await createMaterial(data);
    }
    await refreshMaterials();
    setIsFormOpen(false);
    setEditingMaterial(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Bahan Baku</h1>
          <p className="text-gray-500 mt-1">Kelola stok bahan baku cafe</p>
        </div>
        <Button onClick={handleAddMaterial} icon={<Plus className="h-4 w-4" />}>
          Tambah Bahan
        </Button>
      </div>

      {/* Low Stock Alert */}
      <LowStockAlert materials={materials} />

      <Card>
        {/* Search */}
        <div className="mb-6">
          <SearchInput
            placeholder="Cari bahan baku..."
            value={searchQuery}
            onSearch={setSearchQuery}
            className="max-w-md"
          />
        </div>

        {/* Materials Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500">Memuat data...</p>
            </div>
          </div>
        ) : (
          <MaterialTable
            materials={filteredMaterials}
            onEdit={handleEditMaterial}
            onDelete={handleDeleteMaterial}
          />
        )}
      </Card>

      {/* Add/Edit Form Modal */}
      <MaterialForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMaterial(null);
        }}
        onSubmit={handleFormSubmit}
        material={editingMaterial}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Konfirmasi Hapus
              </h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus bahan baku &quot;{deleteConfirm.name}&quot;?
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
                  Batal
                </Button>
                <Button variant="danger" onClick={confirmDelete}>
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
