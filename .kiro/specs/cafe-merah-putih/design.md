# Design Document: Cafe Merah Putih Management System

## Overview

Aplikasi Manajemen Cafe Merah Putih adalah aplikasi web berbasis Next.js dengan App Router yang menyediakan sistem manajemen cafe lengkap. Aplikasi menggunakan arsitektur client-side dengan local storage untuk penyimpanan data (dapat di-upgrade ke backend API di masa depan). Desain UI menggunakan tema merah-putih dengan komponen modern dan responsif.

### Tech Stack
- **Framework**: Next.js 16.1.1 dengan App Router
- **React**: 19.2.3
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Context + useState
- **Data Storage**: Local Storage (mock data)
- **Authentication**: Simple session-based (local storage)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Next.js App                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │   Pages     │  │  Components │  │   Context   │  │   │
│  │  │  (Routes)   │  │    (UI)     │  │   (State)   │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  │         │                │                │          │   │
│  │         └────────────────┼────────────────┘          │   │
│  │                          │                           │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │              Services Layer                  │    │   │
│  │  │   (Data operations, business logic)          │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  │                          │                           │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │              Local Storage                   │    │   │
│  │  │   (Persistent data storage)                  │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx
├── (dashboard)/
│   ├── layout.tsx          # Dashboard layout with sidebar
│   ├── page.tsx            # Dashboard home
│   ├── transaksi/
│   │   └── page.tsx
│   ├── pegawai/
│   │   └── page.tsx
│   ├── laporan/
│   │   └── page.tsx
│   ├── pemesanan-bahan/
│   │   └── page.tsx
│   ├── penerimaan-stok/
│   │   └── page.tsx
│   ├── produk/
│   │   └── page.tsx
│   └── bahan-baku/
│       └── page.tsx
├── layout.tsx
├── page.tsx                # Redirect to login/dashboard
└── globals.css

components/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Table.tsx
│   ├── Badge.tsx
│   ├── Modal.tsx
│   └── SearchInput.tsx
├── layout/
│   ├── Sidebar.tsx
│   └── Header.tsx
├── charts/
│   ├── AreaChart.tsx
│   ├── BarChart.tsx
│   ├── LineChart.tsx
│   └── DonutChart.tsx
└── features/
    ├── auth/
    │   └── LoginForm.tsx
    ├── dashboard/
    │   ├── StatCard.tsx
    │   └── TopProducts.tsx
    ├── transaksi/
    │   ├── ProductGrid.tsx
    │   └── Cart.tsx
    ├── pegawai/
    │   └── EmployeeCard.tsx
    └── ...

lib/
├── context/
│   └── AuthContext.tsx
├── services/
│   ├── auth.ts
│   ├── products.ts
│   ├── employees.ts
│   ├── transactions.ts
│   ├── materials.ts
│   └── orders.ts
├── types/
│   └── index.ts
├── utils/
│   └── format.ts
└── data/
    └── mockData.ts
```

## Components and Interfaces

### Core UI Components

#### Button Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}
```

#### Card Component
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}
```

#### Table Component
```typescript
interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
}
```

#### Badge Component
```typescript
interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}
```

#### Modal Component
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
```

### Layout Components

#### Sidebar Component
```typescript
interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface SidebarProps {
  activeMenu: string;
}
```

### Feature Components

#### StatCard (Dashboard)
```typescript
interface StatCardProps {
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  value: string;
  change: number;
  changeLabel: string;
}
```

#### ProductGrid (Transaksi)
```typescript
interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  searchQuery: string;
  activeCategory: string;
}
```

#### Cart (Transaksi)
```typescript
interface CartProps {
  items: CartItem[];
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onCheckout: () => void;
}
```

#### EmployeeCard (Pegawai)
```typescript
interface EmployeeCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDelete: (employeeId: string) => void;
}
```

## Data Models

### User/Employee
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Kasir' | 'Barista' | 'Manager';
  status: 'Aktif' | 'Nonaktif';
  password?: string; // For auth only
  createdAt: Date;
}
```

### Product
```typescript
interface Product {
  id: string;
  name: string;
  category: 'Kopi' | 'Non-Kopi' | 'Makanan';
  price: number;
  stock: number;
  status: 'Tersedia' | 'Habis';
  image?: string;
  createdAt: Date;
}
```

### Material (Bahan Baku)
```typescript
interface Material {
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
```

### Transaction
```typescript
interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashierId: string;
  createdAt: Date;
}

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}
```

### Material Order (Pemesanan Bahan)
```typescript
interface MaterialOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: MaterialOrderItem[];
  total: number;
  status: 'Pending' | 'Dikirim' | 'Diterima';
  orderDate: Date;
  createdAt: Date;
}

interface MaterialOrderItem {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  price: number;
  subtotal: number;
}
```

### Stock Receipt (Penerimaan Stok)
```typescript
interface StockReceipt {
  id: string;
  orderId: string;
  supplierId: string;
  supplierName: string;
  items: StockReceiptItem[];
  status: 'Lengkap' | 'Sebagian';
  receiptDate: Date;
  createdAt: Date;
}

interface StockReceiptItem {
  materialId: string;
  materialName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unit: string;
}
```

### Dashboard Statistics
```typescript
interface DashboardStats {
  totalSales: number;
  salesChange: number;
  todayTransactions: number;
  transactionsChange: number;
  activeEmployees: number;
  employeesChange: number;
  productsSold: number;
  productsSoldChange: number;
}

interface WeeklySales {
  day: string;
  sales: number;
}

interface TopProduct {
  name: string;
  sold: number;
}
```

### Report Data
```typescript
interface ReportStats {
  totalRevenue: number;
  revenueChange: number;
  totalExpenses: number;
  expensesChange: number;
  netProfit: number;
  profitChange: number;
  totalTransactions: number;
  transactionsChange: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
}

interface CategorySales {
  category: string;
  percentage: number;
  color: string;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Search Filter Correctness

*For any* list of items (products, employees, materials, orders) and any search query string, all items returned by the search function should contain the query string (case-insensitive) in their searchable fields (name, ID).

**Validates: Requirements 3.2, 4.2, 6.2, 7.2, 8.2, 9.2**

### Property 2: Category Filter Correctness

*For any* list of products and any selected category filter, all products returned should have their category field matching the selected category. When "Semua" is selected, all products should be returned.

**Validates: Requirements 3.3, 8.3**

### Property 3: Cart Calculation Correctness

*For any* cart with items, the following must hold:
- Subtotal equals the sum of (price × quantity) for all items
- Tax equals exactly 10% of subtotal
- Total equals subtotal + tax

**Validates: Requirements 3.5**

### Property 4: Cart Addition Correctness

*For any* product added to cart, the cart should contain that product with quantity incremented. If product already exists in cart, quantity should increase by 1.

**Validates: Requirements 3.4**

### Property 5: Product Status Derivation

*For any* product, if stock > 0 then status should be "Tersedia", otherwise status should be "Habis".

**Validates: Requirements 8.7**

### Property 6: Material Status Derivation

*For any* material (bahan baku), if stock >= minStock then status should be "Aman", otherwise status should be "Stok Rendah".

**Validates: Requirements 9.7**

### Property 7: Low Stock Alert Correctness

*For any* set of materials, the low stock alert should display the count of materials where stock < minStock, and this count should match the actual number of materials with low stock.

**Validates: Requirements 9.6**

### Property 8: Authentication State Correctness

*For any* user session, if user is authenticated then accessing protected routes should succeed, otherwise user should be redirected to login page.

**Validates: Requirements 1.1, 1.5**

### Property 9: Employee Data Display Completeness

*For any* employee displayed in the UI, all required fields (name, email, role, status, phone) should be present and non-empty.

**Validates: Requirements 4.6**

### Property 10: Transaction Persistence

*For any* completed transaction, querying the transaction storage should return the same transaction data with matching items, subtotal, tax, and total.

**Validates: Requirements 3.6**

## Error Handling

### Authentication Errors
- Invalid credentials: Display "Email atau password salah" message
- Session expired: Redirect to login with "Sesi telah berakhir" message
- Unauthorized access: Redirect to login page

### Form Validation Errors
- Empty required fields: Display "Field ini wajib diisi" below the field
- Invalid email format: Display "Format email tidak valid"
- Invalid phone format: Display "Format nomor telepon tidak valid"
- Duplicate email: Display "Email sudah terdaftar"

### Data Operation Errors
- Failed to save: Display toast "Gagal menyimpan data"
- Failed to delete: Display toast "Gagal menghapus data"
- Failed to load: Display "Gagal memuat data, coba lagi" with retry button

### Cart Errors
- Product out of stock: Display toast "Produk tidak tersedia"
- Empty cart checkout: Button disabled, no error needed

## Testing Strategy

### Unit Tests
Unit tests will verify specific examples and edge cases:
- Component rendering tests
- Form validation tests
- Utility function tests (formatCurrency, formatDate)
- Edge cases (empty lists, zero values, boundary conditions)

### Property-Based Tests
Property-based tests will verify universal properties using fast-check library:
- Search filter correctness across random inputs
- Category filter correctness
- Cart calculations with random items and quantities
- Status derivation for random stock values
- Data persistence round-trips

### Test Configuration
- Framework: Jest + React Testing Library
- Property Testing: fast-check
- Minimum 100 iterations per property test
- Each property test tagged with: **Feature: cafe-merah-putih, Property {number}: {property_text}**

### Test File Structure
```
__tests__/
├── components/
│   ├── ui/
│   │   └── Button.test.tsx
│   └── features/
│       └── Cart.test.tsx
├── services/
│   ├── products.test.ts
│   ├── cart.test.ts
│   └── auth.test.ts
└── properties/
    ├── search.property.test.ts
    ├── cart.property.test.ts
    └── status.property.test.ts
```
