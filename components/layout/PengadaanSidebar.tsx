'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  Package,
  ClipboardList,
  Coffee,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/pengadaan' },
  { icon: <Boxes size={20} />, label: 'Data Bahan Baku', href: '/pengadaan/bahan-baku' },
  { icon: <Package size={20} />, label: 'Pemesanan Bahan', href: '/pengadaan/pemesanan' },
  { icon: <ClipboardList size={20} />, label: 'Penerimaan Stok', href: '/pengadaan/penerimaan' },
];

export default function PengadaanSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/pengadaan') {
      return pathname === '/pengadaan';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Coffee className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Caffe</h1>
            <p className="text-sm text-primary font-semibold">Merah Putih</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{user.role}</p>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
