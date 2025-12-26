'use client';

import { useState } from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Material } from '@/lib/types';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface MaterialTableProps {
  materials: Material[];
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
}

const ITEMS_PER_PAGE = 10;

export function MaterialTable({ materials, onEdit, onDelete }: MaterialTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(materials.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMaterials = materials.slice(startIndex, endIndex);

  // Reset to page 1 when materials change (e.g., search)
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const columns = [
    {
      key: 'name',
      header: 'Bahan Baku',
      render: (material: Material) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <span className="text-red-600 font-semibold text-sm">
              {material.name.charAt(0)}
            </span>
          </div>
          <span className="font-medium">{material.name}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
    },
    {
      key: 'stock',
      header: 'Stok',
      render: (material: Material) => (
        <span>{material.stock} {material.unit}</span>
      ),
    },
    {
      key: 'minStock',
      header: 'Min. Stok',
      render: (material: Material) => (
        <span>{material.minStock} {material.unit}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (material: Material) => (
        <Badge variant={material.status === 'Aman' ? 'success' : 'danger'}>
          {material.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (material: Material) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(material);
            }}
            icon={<Pencil className="h-4 w-4" />}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(material);
            }}
            icon={<Trash2 className="h-4 w-4" />}
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Table columns={columns} data={currentMaterials} />
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-gray-500">
            Menampilkan {startIndex + 1}-{Math.min(endIndex, materials.length)} dari {materials.length} bahan
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MaterialTable;
