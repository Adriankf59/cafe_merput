'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import PengadaanSidebar from '@/components/layout/PengadaanSidebar';

export default function PengadaanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    // Redirect non-pengadaan users
    if (!isLoading && isAuthenticated && user?.role !== 'Pengadaan') {
      if (user?.role === 'Barista') {
        router.push('/barista');
      } else if (user?.role === 'Kasir') {
        router.push('/kasir');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'Pengadaan') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PengadaanSidebar />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
