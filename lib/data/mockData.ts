// Mock data for Cafe Merah Putih Management System

import {
  User,
  Product,
  Material,
  Transaction,
  MaterialOrder,
  StockReceipt,
  Supplier,
  DashboardStats,
  WeeklySales,
  TopProduct,
  ReportStats,
  MonthlyData,
  CategorySales,
} from '../types';

// ==================== Suppliers ====================
export const mockSuppliers: Supplier[] = [
  {
    id: 'SUP001',
    name: 'PT Kopi Nusantara',
    contact: '021-5551234',
    email: 'order@kopinusantara.com',
    address: 'Jl. Kopi No. 123, Jakarta',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'SUP002',
    name: 'CV Susu Segar',
    contact: '021-5555678',
    email: 'sales@sususegar.com',
    address: 'Jl. Dairy No. 45, Bandung',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'SUP003',
    name: 'UD Gula Manis',
    contact: '021-5559012',
    email: 'info@gulamanis.com',
    address: 'Jl. Manis No. 67, Surabaya',
    createdAt: new Date('2024-02-01'),
  },
];

// ==================== Users/Employees ====================
export const mockUsers: User[] = [
  {
    id: 'USR001',
    name: 'Ahmad Rizki',
    email: 'ahmad@cafemerahputih.com',
    phone: '081234567890',
    role: 'Manager',
    status: 'Aktif',
    password: 'manager123',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'USR002',
    name: 'Siti Nurhaliza',
    email: 'siti@cafemerahputih.com',
    phone: '081234567891',
    role: 'Kasir',
    status: 'Aktif',
    password: 'kasir123',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'USR003',
    name: 'Budi Santoso',
    email: 'budi@cafemerahputih.com',
    phone: '081234567892',
    role: 'Barista',
    status: 'Aktif',
    password: 'barista123',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'USR004',
    name: 'Dewi Lestari',
    email: 'dewi@cafemerahputih.com',
    phone: '081234567893',
    role: 'Kasir',
    status: 'Aktif',
    password: 'kasir456',
    createdAt: new Date('2024-02-15'),
  },
  {
    id: 'USR005',
    name: 'Eko Prasetyo',
    email: 'eko@cafemerahputih.com',
    phone: '081234567894',
    role: 'Barista',
    status: 'Nonaktif',
    password: 'barista456',
    createdAt: new Date('2024-03-01'),
  },
];

// ==================== Products ====================
export const mockProducts: Product[] = [
  {
    id: 'PRD001',
    name: 'Espresso',
    category: 'Kopi',
    price: 18000,
    stock: 50,
    status: 'Tersedia',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'PRD002',
    name: 'Americano',
    category: 'Kopi',
    price: 22000,
    stock: 45,
    status: 'Tersedia',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'PRD003',
    name: 'Cappuccino',
    category: 'Kopi',
    price: 28000,
    stock: 40,
    status: 'Tersedia',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'PRD004',
    name: 'Latte',
    category: 'Kopi',
    price: 28000,
    stock: 35,
    status: 'Tersedia',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'PRD005',
    name: 'Mocha',
    category: 'Kopi',
    price: 32000,
    stock: 30,
    status: 'Tersedia',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'PRD006',
    name: 'Matcha Latte',
    category: 'Non-Kopi',
    price: 30000,
    stock: 25,
    status: 'Tersedia',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'PRD007',
    name: 'Teh Tarik',
    category: 'Non-Kopi',
    price: 20000,
    stock: 40,
    status: 'Tersedia',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'PRD008',
    name: 'Coklat Panas',
    category: 'Non-Kopi',
    price: 25000,
    stock: 30,
    status: 'Tersedia',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'PRD009',
    name: 'Jus Jeruk',
    category: 'Non-Kopi',
    price: 18000,
    stock: 0,
    status: 'Habis',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'PRD010',
    name: 'Croissant',
    category: 'Makanan',
    price: 25000,
    stock: 20,
    status: 'Tersedia',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'PRD011',
    name: 'Roti Bakar',
    category: 'Makanan',
    price: 22000,
    stock: 15,
    status: 'Tersedia',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'PRD012',
    name: 'Sandwich',
    category: 'Makanan',
    price: 35000,
    stock: 10,
    status: 'Tersedia',
    createdAt: new Date('2024-02-01'),
  },
];


// ==================== Materials (Bahan Baku) ====================
export const mockMaterials: Material[] = [
  {
    id: 'MAT001',
    name: 'Biji Kopi Arabica',
    category: 'Kopi',
    stock: 25,
    unit: 'kg',
    minStock: 10,
    supplierId: 'SUP001',
    supplierName: 'PT Kopi Nusantara',
    status: 'Aman',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'MAT002',
    name: 'Biji Kopi Robusta',
    category: 'Kopi',
    stock: 20,
    unit: 'kg',
    minStock: 10,
    supplierId: 'SUP001',
    supplierName: 'PT Kopi Nusantara',
    status: 'Aman',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'MAT003',
    name: 'Susu Full Cream',
    category: 'Dairy',
    stock: 15,
    unit: 'liter',
    minStock: 20,
    supplierId: 'SUP002',
    supplierName: 'CV Susu Segar',
    status: 'Stok Rendah',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'MAT004',
    name: 'Susu Oat',
    category: 'Dairy',
    stock: 8,
    unit: 'liter',
    minStock: 10,
    supplierId: 'SUP002',
    supplierName: 'CV Susu Segar',
    status: 'Stok Rendah',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'MAT005',
    name: 'Gula Pasir',
    category: 'Pemanis',
    stock: 30,
    unit: 'kg',
    minStock: 15,
    supplierId: 'SUP003',
    supplierName: 'UD Gula Manis',
    status: 'Aman',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'MAT006',
    name: 'Sirup Vanilla',
    category: 'Pemanis',
    stock: 5,
    unit: 'liter',
    minStock: 8,
    supplierId: 'SUP003',
    supplierName: 'UD Gula Manis',
    status: 'Stok Rendah',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'MAT007',
    name: 'Cup Plastik 12oz',
    category: 'Lainnya',
    stock: 500,
    unit: 'pcs',
    minStock: 200,
    supplierId: 'SUP001',
    supplierName: 'PT Kopi Nusantara',
    status: 'Aman',
    createdAt: new Date('2024-02-15'),
  },
];


// ==================== Transactions ====================
export const mockTransactions: Transaction[] = [
  {
    id: 'TRX001',
    items: [
      { productId: 'PRD001', productName: 'Espresso', price: 18000, quantity: 2, subtotal: 36000 },
      { productId: 'PRD010', productName: 'Croissant', price: 25000, quantity: 1, subtotal: 25000 },
    ],
    subtotal: 61000,
    tax: 6100,
    total: 67100,
    paymentMethod: 'Cash',
    cashierId: 'USR002',
    createdAt: new Date('2024-12-20T09:30:00'),
  },
  {
    id: 'TRX002',
    items: [
      { productId: 'PRD003', productName: 'Cappuccino', price: 28000, quantity: 1, subtotal: 28000 },
      { productId: 'PRD004', productName: 'Latte', price: 28000, quantity: 1, subtotal: 28000 },
    ],
    subtotal: 56000,
    tax: 5600,
    total: 61600,
    paymentMethod: 'QRIS',
    cashierId: 'USR002',
    createdAt: new Date('2024-12-20T10:15:00'),
  },
  {
    id: 'TRX003',
    items: [
      { productId: 'PRD006', productName: 'Matcha Latte', price: 30000, quantity: 2, subtotal: 60000 },
      { productId: 'PRD012', productName: 'Sandwich', price: 35000, quantity: 2, subtotal: 70000 },
    ],
    subtotal: 130000,
    tax: 13000,
    total: 143000,
    paymentMethod: 'Debit',
    cashierId: 'USR004',
    createdAt: new Date('2024-12-20T12:00:00'),
  },
  {
    id: 'TRX004',
    items: [
      { productId: 'PRD005', productName: 'Mocha', price: 32000, quantity: 3, subtotal: 96000 },
    ],
    subtotal: 96000,
    tax: 9600,
    total: 105600,
    paymentMethod: 'Cash',
    cashierId: 'USR002',
    createdAt: new Date('2024-12-21T14:30:00'),
  },
  {
    id: 'TRX005',
    items: [
      { productId: 'PRD007', productName: 'Teh Tarik', price: 20000, quantity: 2, subtotal: 40000 },
      { productId: 'PRD011', productName: 'Roti Bakar', price: 22000, quantity: 1, subtotal: 22000 },
    ],
    subtotal: 62000,
    tax: 6200,
    total: 68200,
    paymentMethod: 'QRIS',
    cashierId: 'USR004',
    createdAt: new Date('2024-12-21T16:00:00'),
  },
];


// ==================== Material Orders (Pemesanan Bahan) ====================
export const mockMaterialOrders: MaterialOrder[] = [
  {
    id: 'ORD001',
    supplierId: 'SUP001',
    supplierName: 'PT Kopi Nusantara',
    items: [
      { materialId: 'MAT001', materialName: 'Biji Kopi Arabica', quantity: 10, unit: 'kg', price: 150000, subtotal: 1500000 },
      { materialId: 'MAT002', materialName: 'Biji Kopi Robusta', quantity: 10, unit: 'kg', price: 120000, subtotal: 1200000 },
    ],
    total: 2700000,
    status: 'Diterima',
    orderDate: new Date('2024-12-15'),
    createdAt: new Date('2024-12-15'),
  },
  {
    id: 'ORD002',
    supplierId: 'SUP002',
    supplierName: 'CV Susu Segar',
    items: [
      { materialId: 'MAT003', materialName: 'Susu Full Cream', quantity: 20, unit: 'liter', price: 25000, subtotal: 500000 },
      { materialId: 'MAT004', materialName: 'Susu Oat', quantity: 10, unit: 'liter', price: 45000, subtotal: 450000 },
    ],
    total: 950000,
    status: 'Dikirim',
    orderDate: new Date('2024-12-18'),
    createdAt: new Date('2024-12-18'),
  },
  {
    id: 'ORD003',
    supplierId: 'SUP003',
    supplierName: 'UD Gula Manis',
    items: [
      { materialId: 'MAT005', materialName: 'Gula Pasir', quantity: 15, unit: 'kg', price: 18000, subtotal: 270000 },
      { materialId: 'MAT006', materialName: 'Sirup Vanilla', quantity: 5, unit: 'liter', price: 85000, subtotal: 425000 },
    ],
    total: 695000,
    status: 'Pending',
    orderDate: new Date('2024-12-20'),
    createdAt: new Date('2024-12-20'),
  },
];


// ==================== Stock Receipts (Penerimaan Stok) ====================
export const mockStockReceipts: StockReceipt[] = [
  {
    id: 'RCP001',
    orderId: 'ORD001',
    supplierId: 'SUP001',
    supplierName: 'PT Kopi Nusantara',
    items: [
      { materialId: 'MAT001', materialName: 'Biji Kopi Arabica', orderedQuantity: 10, receivedQuantity: 10, unit: 'kg' },
      { materialId: 'MAT002', materialName: 'Biji Kopi Robusta', orderedQuantity: 10, receivedQuantity: 10, unit: 'kg' },
    ],
    status: 'Lengkap',
    receiptDate: new Date('2024-12-17'),
    createdAt: new Date('2024-12-17'),
  },
  {
    id: 'RCP002',
    orderId: 'ORD002',
    supplierId: 'SUP002',
    supplierName: 'CV Susu Segar',
    items: [
      { materialId: 'MAT003', materialName: 'Susu Full Cream', orderedQuantity: 20, receivedQuantity: 15, unit: 'liter' },
      { materialId: 'MAT004', materialName: 'Susu Oat', orderedQuantity: 10, receivedQuantity: 8, unit: 'liter' },
    ],
    status: 'Sebagian',
    receiptDate: new Date('2024-12-20'),
    createdAt: new Date('2024-12-20'),
  },
];

// ==================== Dashboard Statistics ====================
export const mockDashboardStats: DashboardStats = {
  totalSales: 15750000,
  salesChange: 12.5,
  todayTransactions: 45,
  transactionsChange: 8.3,
  activeEmployees: 4,
  employeesChange: 0,
  productsSold: 156,
  productsSoldChange: 15.2,
};

export const mockWeeklySales: WeeklySales[] = [
  { day: 'Sen', sales: 2100000 },
  { day: 'Sel', sales: 1850000 },
  { day: 'Rab', sales: 2300000 },
  { day: 'Kam', sales: 2450000 },
  { day: 'Jum', sales: 2800000 },
  { day: 'Sab', sales: 3200000 },
  { day: 'Min', sales: 1050000 },
];

export const mockTopProducts: TopProduct[] = [
  { name: 'Cappuccino', sold: 45 },
  { name: 'Latte', sold: 38 },
  { name: 'Americano', sold: 32 },
  { name: 'Matcha Latte', sold: 28 },
  { name: 'Mocha', sold: 25 },
];


// ==================== Report Data ====================
export const mockReportStats: ReportStats = {
  totalRevenue: 45250000,
  revenueChange: 15.3,
  totalExpenses: 18500000,
  expensesChange: 8.2,
  netProfit: 26750000,
  profitChange: 20.1,
  totalTransactions: 1250,
  transactionsChange: 12.5,
};

export const mockMonthlyData: MonthlyData[] = [
  { month: 'Jan', revenue: 12500000, expenses: 5200000 },
  { month: 'Feb', revenue: 13200000, expenses: 5500000 },
  { month: 'Mar', revenue: 14100000, expenses: 5800000 },
  { month: 'Apr', revenue: 13800000, expenses: 5600000 },
  { month: 'Mei', revenue: 15200000, expenses: 6100000 },
  { month: 'Jun', revenue: 14500000, expenses: 5900000 },
  { month: 'Jul', revenue: 15800000, expenses: 6300000 },
  { month: 'Agu', revenue: 16200000, expenses: 6500000 },
  { month: 'Sep', revenue: 15500000, expenses: 6200000 },
  { month: 'Okt', revenue: 16800000, expenses: 6700000 },
  { month: 'Nov', revenue: 17500000, expenses: 7000000 },
  { month: 'Des', revenue: 18200000, expenses: 7200000 },
];

export const mockCategorySales: CategorySales[] = [
  { category: 'Kopi', percentage: 55, color: '#DC2626' },
  { category: 'Non-Kopi', percentage: 28, color: '#F87171' },
  { category: 'Makanan', percentage: 17, color: '#FCA5A5' },
];
