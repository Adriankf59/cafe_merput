// Type definitions for Cafe Merah Putih Management System

// ==================== User/Employee ====================
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Kasir' | 'Barista' | 'Manager';
  status: 'Aktif' | 'Nonaktif';
  password?: string;
  createdAt: Date;
}

export type UserRole = User['role'];
export type UserStatus = User['status'];

// ==================== Product ====================
export interface Product {
  id: string;
  name: string;
  category: 'Kopi' | 'Non-Kopi' | 'Makanan';
  price: number;
  stock: number;
  status: 'Tersedia' | 'Habis';
  image?: string;
  createdAt: Date;
}

export type ProductCategory = Product['category'];
export type ProductStatus = Product['status'];

// ==================== Material (Bahan Baku) ====================
export interface Material {
  id: string;
  name: string;
  category: 'Kopi' | 'Dairy' | 'Pemanis' | 'Lainnya';
  stock: number;
  unit: 'kg' | 'liter' | 'pcs';
  minStock: number;
  supplierId: string;
  supplierName: string;
  status: 'Aman' | 'Stok Rendah';
  createdAt: Date;
}

export type MaterialCategory = Material['category'];
export type MaterialUnit = Material['unit'];
export type MaterialStatus = Material['status'];


// ==================== Transaction ====================
export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashierId: string;
  createdAt: Date;
}

// ==================== Material Order (Pemesanan Bahan) ====================
export interface MaterialOrderItem {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  price: number;
  subtotal: number;
}

export interface MaterialOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: MaterialOrderItem[];
  total: number;
  status: 'Pending' | 'Dikirim' | 'Diterima';
  orderDate: Date;
  createdAt: Date;
}

export type MaterialOrderStatus = MaterialOrder['status'];

// ==================== Stock Receipt (Penerimaan Stok) ====================
export interface StockReceiptItem {
  materialId: string;
  materialName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unit: string;
}

export interface StockReceipt {
  id: string;
  orderId: string;
  supplierId: string;
  supplierName: string;
  items: StockReceiptItem[];
  status: 'Lengkap' | 'Sebagian';
  receiptDate: Date;
  createdAt: Date;
}

export type StockReceiptStatus = StockReceipt['status'];


// ==================== Dashboard Statistics ====================
export interface DashboardStats {
  totalSales: number;
  salesChange: number;
  todayTransactions: number;
  transactionsChange: number;
  activeEmployees: number;
  employeesChange: number;
  productsSold: number;
  productsSoldChange: number;
}

export interface WeeklySales {
  day: string;
  sales: number;
}

export interface TopProduct {
  name: string;
  sold: number;
}

// ==================== Report Data ====================
export interface ReportStats {
  totalRevenue: number;
  revenueChange: number;
  totalExpenses: number;
  expensesChange: number;
  netProfit: number;
  profitChange: number;
  totalTransactions: number;
  transactionsChange: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
}

export interface CategorySales {
  category: string;
  percentage: number;
  color: string;
}

// ==================== Supplier ====================
export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  createdAt: Date;
}
