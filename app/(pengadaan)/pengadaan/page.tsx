'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { Boxes, AlertTriangle, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMaterials, getLowStockMaterials } from '@/lib/services/materials';
import { Material } from '@/lib/types';

interface DashboardStat {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const ITEMS_PER_PAGE = 10;

export default function PengadaanDashboardPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [lowStockMaterials, setLowStockMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [allMaterials, lowStock] = await Promise.all([
          getMaterials(),
          getLowStockMaterials(),
        ]);
        setMaterials(allMaterials);
        setLowStockMaterials(lowStock);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalPages = Math.ceil(materials.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMaterials = materials.slice(startIndex, endIndex);

  const stats: DashboardStat[] = [
    {
      title: 'Total Bahan Baku',
      value: materials.length,
      icon: <Boxes className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Stok Rendah',
      value: lowStockMaterials.length,
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Stok Aman',
      value: materials.length - lowStockMaterials.length,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Pengadaan</h1>
        <p className="text-gray-500 mt-1">Kelola stok dan pengadaan bahan baku</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Low Stock Alert */}
      {lowStockMaterials.length > 0 && (
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900">Peringatan Stok Rendah</h3>
              <p className="text-sm text-gray-500 mt-1">
                {lowStockMaterials.length} bahan baku memiliki stok di bawah minimum
              </p>
              <div className="mt-3 space-y-2">
                {lowStockMaterials.slice(0, 5).map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between bg-red-50 px-3 py-2 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-900">{material.name}</span>
                    <span className="text-sm text-red-600">
                      {material.stock} {material.unit} (min: {material.minStock})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Materials Table with Pagination */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Daftar Bahan Baku</h3>
          {totalPages > 1 && (
            <span className="text-sm text-gray-500">
              Halaman {currentPage} dari {totalPages}
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  No
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Nama Bahan
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Stok
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Min. Stok
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentMaterials.map((material, index) => (
                <tr key={material.id}>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{material.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {material.stock} {material.unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {material.minStock} {material.unit}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        material.status === 'Aman'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {material.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
      </Card>
    </div>
  );
}
