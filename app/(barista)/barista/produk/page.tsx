'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { BaristaHeader } from '@/components/features/barista';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ProductCategory } from '@/lib/types';

interface ProductMaterial {
  bahan_id: string;
  jumlah: number;
  nama_bahan?: string;
  satuan?: string;
}

interface ApiProduct {
  produk_id: string;
  id?: string; // alias for Table component
  nama_produk: string;
  harga: number;
  jenis_produk: ProductCategory;
  is_available: boolean;
  materials?: ProductMaterial[];
}

interface ApiMaterial {
  bahan_id: string;
  nama_bahan: string;
  satuan: string;
  stok_saat_ini: number;
}

const categories: ProductCategory[] = ['Kopi', 'Non-Kopi', 'Makanan'];

export default function BaristaProductPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [materials, setMaterials] = useState<ApiMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<ApiProduct | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Kopi' as ProductCategory,
    price: '',
    compositions: [] as { bahan_id: string; jumlah: string }[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        // Fetch materials for each product
        const productsWithMaterials = await Promise.all(
          data.data.map(async (product: ApiProduct) => {
            const matRes = await fetch(`/api/products/${product.produk_id}/materials`);
            const matData = await matRes.json();
            return {
              ...product,
              id: product.produk_id, // Add id for Table component
              materials: matData.success ? matData.data : [],
            };
          })
        );
        setProducts(productsWithMaterials);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/materials');
      const data = await res.json();
      if (data.success) {
        setMaterials(data.data);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchMaterials();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Kopi',
      price: '',
      compositions: [],
    });
    setErrors({});
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (product: ApiProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.nama_produk,
      category: product.jenis_produk,
      price: product.harga.toString(),
      compositions: product.materials?.map((m) => ({
        bahan_id: m.bahan_id,
        jumlah: m.jumlah.toString(),
      })) || [],
    });
    setIsModalOpen(true);
  };

  const addComposition = () => {
    setFormData((prev) => ({
      ...prev,
      compositions: [...prev.compositions, { bahan_id: '', jumlah: '' }],
    }));
  };

  const removeComposition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      compositions: prev.compositions.filter((_, i) => i !== index),
    }));
  };

  const updateComposition = (index: number, field: 'bahan_id' | 'jumlah', value: string) => {
    setFormData((prev) => ({
      ...prev,
      compositions: prev.compositions.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nama produk wajib diisi';
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Harga harus lebih dari 0';
    
    formData.compositions.forEach((c, i) => {
      if (c.bahan_id && (!c.jumlah || Number(c.jumlah) <= 0)) {
        newErrors[`composition_${i}`] = 'Jumlah harus lebih dari 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const productData = {
        nama_produk: formData.name,
        jenis_produk: formData.category,
        harga: Number(formData.price),
      };

      let productId: string;

      if (editingProduct) {
        // Update product
        const res = await fetch(`/api/products/${editingProduct.produk_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        productId = editingProduct.produk_id;
      } else {
        // Create product
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        productId = data.data.produk_id;
      }

      // Update materials/compositions
      const validCompositions = formData.compositions.filter(
        (c) => c.bahan_id && c.jumlah && Number(c.jumlah) > 0
      );

      await fetch(`/api/products/${productId}/materials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materials: validCompositions.map((c) => ({
            bahan_id: c.bahan_id,
            jumlah: Number(c.jumlah),
          })),
        }),
      });

      setIsModalOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Gagal menyimpan produk');
    }
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    try {
      const res = await fetch(`/api/products/${deleteProduct.produk_id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeleteProduct(null);
        fetchProducts();
      } else {
        alert(data.message || 'Gagal menghapus produk');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Gagal menghapus produk');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.nama_produk?.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  const columns = [
    {
      key: 'nama_produk',
      header: 'Produk',
      render: (product: ApiProduct) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <span className="text-red-600 font-semibold text-sm">{product.nama_produk?.charAt(0)}</span>
          </div>
          <span className="font-medium">{product.nama_produk}</span>
        </div>
      ),
    },
    { key: 'jenis_produk', header: 'Kategori' },
    { key: 'harga', header: 'Harga', render: (p: ApiProduct) => formatCurrency(p.harga) },
    {
      key: 'compositions',
      header: 'Komposisi',
      render: (product: ApiProduct) => (
        <div className="text-sm text-gray-600">
          {product.materials && product.materials.length > 0
            ? product.materials.map((m) => `${m.nama_bahan} (${m.jumlah} ${m.satuan})`).join(', ')
            : '-'}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p: ApiProduct) => (
        <Badge variant={p.is_available ? 'success' : 'danger'}>
          {p.is_available ? 'Tersedia' : 'Habis'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (product: ApiProduct) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(product)} icon={<Pencil className="h-4 w-4" />}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteProduct(product)} icon={<Trash2 className="h-4 w-4" />}>
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <BaristaHeader onSignOut={handleLogout} />

      <div className="flex-1 p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Data Produk</h2>
              <Button onClick={openAddModal} icon={<Plus className="h-4 w-4" />}>Tambah Produk</Button>
            </div>
            <div className="mt-4 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Memuat data...</div>
            ) : (
              <Table columns={columns} data={filteredProducts} />
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Edit Produk' : 'Tambah Produk'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama Produk" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} error={errors.name} />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value as ProductCategory }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <Input label="Harga (Rp)" type="number" value={formData.price} onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))} error={errors.price} />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Komposisi Bahan</label>
              <Button type="button" variant="secondary" size="sm" onClick={addComposition}>+ Tambah Bahan</Button>
            </div>
            {formData.compositions.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada komposisi bahan</p>
            ) : (
              <div className="space-y-2">
                {formData.compositions.map((comp, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={comp.bahan_id}
                      onChange={(e) => updateComposition(idx, 'bahan_id', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    >
                      <option value="">Pilih bahan</option>
                      {materials.map((m) => (
                        <option key={m.bahan_id} value={m.bahan_id}>{m.nama_bahan} ({m.satuan})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Jumlah"
                      value={comp.jumlah}
                      onChange={(e) => updateComposition(idx, 'jumlah', e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                    <Button type="button" variant="danger" size="sm" onClick={() => removeComposition(idx)}>×</Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit">{editingProduct ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteProduct} onClose={() => setDeleteProduct(null)} title="Hapus Produk">
        <p className="text-gray-600 mb-6">Apakah Anda yakin ingin menghapus produk <strong>{deleteProduct?.nama_produk}</strong>?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteProduct(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus</Button>
        </div>
      </Modal>
    </div>
  );
}
