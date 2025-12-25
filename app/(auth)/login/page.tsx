'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/features/auth/LoginForm';
import { useAuth } from '@/lib/context/AuthContext';

// Helper function to get redirect path based on role
function getRedirectPath(role: string): string {
  switch (role) {
    case 'Barista':
      return '/barista';
    case 'Kasir':
      return '/kasir';
    case 'Pengadaan':
      return '/pengadaan';
    default:
      return '/dashboard';
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect based on role if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const redirectPath = getRedirectPath(user.role);
      router.push(redirectPath);
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Memuat...</div>
      </div>
    );
  }

  // Don't render login form if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <span className="text-white text-2xl font-bold">CM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Caffe Merah Putih</h1>
          <p className="text-gray-500 mt-2">Masuk ke akun Anda</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <LoginForm />
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600 font-medium mb-2">Demo Credentials:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Manager: manager@cafemerahputih.com / manager123</p>
            <p>Kasir: kasir@cafemerahputih.com / kasir123</p>
            <p>Barista: barista@cafemerahputih.com / barista123</p>
            <p>Pengadaan: pengadaan@cafemerahputih.com / pengadaan123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
