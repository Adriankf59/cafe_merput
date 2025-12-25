'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout';
import { useAuth } from '@/lib/context/AuthContext';

export default function DashboardLayout({
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
    // Redirect barista to their own dashboard
    if (!isLoading && isAuthenticated && user?.role === 'Barista') {
      router.push('/barista');
    }
    // Redirect kasir to their own transaction page
    if (!isLoading && isAuthenticated && user?.role === 'Kasir') {
      router.push('/kasir');
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Show loading while checking auth state
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

  // Don't render children if not authenticated or if barista/kasir
  if (!isAuthenticated || user?.role === 'Barista' || user?.role === 'Kasir') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
