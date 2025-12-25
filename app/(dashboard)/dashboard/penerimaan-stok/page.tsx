'use client';

import { useState, useCallback, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { StockReceipt } from '@/lib/types';
import {
  getReceipts,
  searchReceipts,
  createReceipt,
} from '@/lib/services/receipts';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Card } from '@/components/ui/Card';
import { ReceiptsTable } from '@/components/features/penerimaan-stok/ReceiptsTable';
import { ReceiptForm } from '@/components/features/penerimaan-stok/ReceiptForm';
import { ReceiptDetail } from '@/components/features/penerimaan-stok/ReceiptDetail';

export default function PenerimaanStokPage() {
  const [receipts, setReceipts] = useState<StockReceipt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<StockReceipt | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshReceipts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getReceipts();
      setReceipts(data);
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
      setReceipts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshReceipts();
  }, [refreshReceipts]);

  // Apply search filter
  const filteredReceipts = searchReceipts(receipts, searchQuery);

  const handleCreateReceipt = () => {
    setIsFormOpen(true);
  };

  const handleViewDetail = (receipt: StockReceipt) => {
    setSelectedReceipt(receipt);
    setIsDetailOpen(true);
  };

  const handleFormSubmit = (data: Omit<StockReceipt, 'id' | 'status' | 'createdAt'>) => {
    createReceipt(data);
    refreshReceipts();
    setIsFormOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Penerimaan Stok</h1>
        <Button onClick={handleCreateReceipt} icon={<Plus className="h-4 w-4" />}>
          Catat Penerimaan
        </Button>
      </div>

      <Card>
        {/* Search */}
        <div className="mb-6">
          <SearchInput
            placeholder="Cari berdasarkan ID penerimaan, ID pesanan, atau supplier..."
            value={searchQuery}
            onSearch={setSearchQuery}
            className="max-w-md"
          />
        </div>

        {/* Receipts Table */}
        <ReceiptsTable
          receipts={filteredReceipts}
          onViewDetail={handleViewDetail}
        />
      </Card>

      {/* Create Receipt Form Modal */}
      <ReceiptForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Receipt Detail Modal */}
      <ReceiptDetail
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedReceipt(null);
        }}
        receipt={selectedReceipt}
      />
    </div>
  );
}
