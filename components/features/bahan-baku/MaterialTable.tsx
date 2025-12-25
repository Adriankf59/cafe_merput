'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Material } from '@/lib/types';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface MaterialTableProps {
  materials: Material[];
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
}

export function MaterialTable({ materials, onEdit, onDelete }: MaterialTableProps) {
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
      key: 'supplierName',
      header: 'Supplier',
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

  return <Table columns={columns} data={materials} />;
}

export default MaterialTable;
