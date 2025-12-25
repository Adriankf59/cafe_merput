# Design Document: Backend MySQL untuk Cafe Merah Putih

## Overview

Backend API untuk Aplikasi Manajemen Cafe Merah Putih menggunakan Next.js API Routes dengan mysql2 library untuk koneksi langsung ke MySQL database. Arsitektur ini menjadikan Next.js sebagai fullstack framework yang menangani baik frontend maupun backend dalam satu aplikasi.

### Tech Stack
- **Framework**: Next.js 16.1.1 dengan App Router
- **Database**: MySQL 8.0+
- **Database Driver**: mysql2 dengan promise wrapper
- **Authentication**: JWT (jsonwebtoken) dengan bcrypt untuk password hashing
- **Validation**: Zod untuk schema validation
- **Language**: TypeScript 5

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
│  │  │           API Routes (Backend)               │    │   │
│  │  │   /api/auth, /api/products, /api/...         │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  │                          │                           │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │              Database Layer                  │    │   │
│  │  │   mysql2 connection pool + queries           │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     MySQL Database                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  users  │ │products │ │materials│ │suppliers│           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │transactions │ │material_    │ │stock_       │           │
│  │             │ │orders       │ │receipts     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Folder Structure (Backend Addition)

```
app/
├── api/
│   ├── auth/
│   │   ├── login/
│   │   │   └── route.ts
│   │   ├── logout/
│   │   │   └── route.ts
│   │   └── me/
│   │       └── route.ts
│   ├── roles/
│   │   ├── route.ts              # GET all, POST create
│   │   └── [id]/
│   │       └── route.ts          # GET one, PUT update, DELETE
│   ├── products/
│   │   ├── route.ts              # GET all, POST create
│   │   ├── [id]/
│   │   │   └── route.ts          # GET one, PUT update, DELETE
│   │   └── [id]/materials/
│   │       └── route.ts          # GET/POST product materials
│   ├── materials/
│   │   ├── route.ts
│   │   ├── [id]/
│   │   │   └── route.ts
│   │   └── low-stock/
│   │       └── route.ts
│   ├── employees/
│   │   ├── route.ts
│   │   └── [id]/
│   │       └── route.ts
│   ├── transactions/
│   │   ├── route.ts
│   │   └── [id]/
│   │       └── route.ts
│   ├── orders/
│   │   ├── route.ts              # Pengadaan Bahan Baku
│   │   └── [id]/
│   │       └── route.ts
│   ├── dashboard/
│   │   ├── stats/
│   │   │   └── route.ts
│   │   ├── weekly-sales/
│   │   │   └── route.ts
│   │   └── top-products/
│   │       └── route.ts
│   └── reports/
│       ├── summary/
│       │   └── route.ts
│       ├── revenue-expense/
│       │   └── route.ts
│       └── category-sales/
│           └── route.ts

lib/
├── db/
│   ├── connection.ts             # MySQL connection pool
│   ├── queries/
│   │   ├── roles.ts
│   │   ├── users.ts
│   │   ├── products.ts
│   │   ├── materials.ts
│   │   ├── product-materials.ts
│   │   ├── transactions.ts
│   │   ├── orders.ts
│   │   ├── dashboard.ts          # Dashboard statistics queries
│   │   └── reports.ts            # Reports queries
│   └── schema.sql                # Database schema
├── middleware/
│   └── auth.ts                   # JWT verification middleware
├── utils/
│   ├── jwt.ts                    # JWT helpers
│   ├── password.ts               # bcrypt helpers
│   └── response.ts               # API response helpers
└── validations/
    ├── auth.ts
    ├── role.ts
    ├── product.ts
    ├── material.ts
    ├── product-material.ts
    ├── employee.ts
    ├── transaction.ts
    └── order.ts
```

## Components and Interfaces

### Database Connection

```typescript
// lib/db/connection.ts
import mysql from 'mysql2/promise';

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
}

const pool: mysql.Pool;

function getConnection(): Promise<mysql.PoolConnection>;
function query<T>(sql: string, params?: any[]): Promise<T[]>;
function execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader>;
```

### API Response Format

```typescript
// lib/utils/response.ts
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

function successResponse<T>(data: T, message?: string): ApiResponse<T>;
function errorResponse(error: string, statusCode?: number): ApiResponse<null>;
```

### JWT Utilities

```typescript
// lib/utils/jwt.ts
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

function generateToken(payload: JWTPayload): string;
function verifyToken(token: string): JWTPayload | null;
function getTokenFromHeader(request: Request): string | null;
```

### Auth Middleware

```typescript
// lib/middleware/auth.ts
interface AuthenticatedRequest extends Request {
  user: JWTPayload;
}

function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<Response>
): (req: Request) => Promise<Response>;
```

## Data Models

### Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────────┐
│    Role     │         │      Akun       │
├─────────────┤         ├─────────────────┤
│ PK role_id  │◄────────┤ PK user_id      │
│    nama_role│ MEMILIKI│    username     │
└─────────────┘         │    password     │
                        │    email        │
                        │ FK role_id      │
                        └────────┬────────┘
                                 │ MELAKUKAN
                                 │ MENCATAT
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────────┐   ┌─────────────────────┐   ┌─────────────────┐
│    Bahan Baku     │   │ Pengadaan Bahan Baku│   │Transaksi Penjual│
├───────────────────┤   ├─────────────────────┤   ├─────────────────┤
│ PK bahan_id       │◄──┤ PK pengadaan_id     │   │ PK transaksi_id │
│    nama_bahan     │   │ FK bahan_id         │   │ FK user_id      │
│    stok_saat_ini  │   │ FK user_id          │   │    tanggal      │
│    stok_minimum   │   │    jumlah           │   │    total_harga  │
│    satuan         │   │    tanggal_pesan    │   └────────┬────────┘
└─────────┬─────────┘   │    tanggal_terima   │            │
          │             │    status           │            │ TERDIRI DARI
          │             └─────────────────────┘            │
          │ DIGUNAKAN DALAM                                ▼
          │                                       ┌─────────────────┐
          ▼                                       │Detail Penjualan │
┌─────────────────────┐                           ├─────────────────┤
│Bahan Baku per Produk│                           │ PK detail_id    │
├─────────────────────┤                           │ FK transaksi_id │
│ FK produk_id        │◄──┐                       │ FK produk_id    │
│ FK bahan_id         │   │                       │    jumlah       │
│    jumlah           │   │                       └────────┬────────┘
└─────────────────────┘   │ MENGGUNAKAN                    │
                          │                                │ TERDAPAT
                          │                                │
                    ┌─────┴─────────┐                      │
                    │    Produk     │◄─────────────────────┘
                    ├───────────────┤
                    │ PK produk_id  │
                    │    nama_produk│
                    │    harga      │
                    │    deskripsi  │
                    │    jenis_produk│
                    └───────────────┘
```

### Database Schema

```sql
-- Database: cafe_merah_putih

-- Role table
CREATE TABLE roles (
  role_id VARCHAR(36) PRIMARY KEY,
  nama_role VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Akun table (Users/Employees)
CREATE TABLE users (
  user_id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role_id VARCHAR(36) NOT NULL,
  status ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
);

-- Produk table
CREATE TABLE products (
  produk_id VARCHAR(36) PRIMARY KEY,
  nama_produk VARCHAR(100) NOT NULL,
  harga DECIMAL(12, 2) NOT NULL,
  deskripsi TEXT,
  jenis_produk ENUM('Kopi', 'Non-Kopi', 'Makanan') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bahan Baku table (Materials)
CREATE TABLE materials (
  bahan_id VARCHAR(36) PRIMARY KEY,
  nama_bahan VARCHAR(100) NOT NULL,
  stok_saat_ini DECIMAL(10, 2) DEFAULT 0,
  stok_minimum DECIMAL(10, 2) NOT NULL,
  satuan ENUM('kg', 'liter', 'pcs', 'gram', 'ml') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bahan Baku per Produk table (Product-Material junction)
CREATE TABLE product_materials (
  produk_id VARCHAR(36) NOT NULL,
  bahan_id VARCHAR(36) NOT NULL,
  jumlah DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (produk_id, bahan_id),
  FOREIGN KEY (produk_id) REFERENCES products(produk_id) ON DELETE CASCADE,
  FOREIGN KEY (bahan_id) REFERENCES materials(bahan_id) ON DELETE CASCADE
);

-- Pengadaan Bahan Baku table (Material Procurement/Orders)
CREATE TABLE material_orders (
  pengadaan_id VARCHAR(36) PRIMARY KEY,
  bahan_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  jumlah DECIMAL(10, 2) NOT NULL,
  tanggal_pesan DATE NOT NULL,
  tanggal_terima DATE,
  status ENUM('Pending', 'Dikirim', 'Diterima') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bahan_id) REFERENCES materials(bahan_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Transaksi Penjualan table (Sales Transactions)
CREATE TABLE transactions (
  transaksi_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  tanggal TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_harga DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Detail Penjualan table (Transaction Items)
CREATE TABLE transaction_items (
  detail_id VARCHAR(36) PRIMARY KEY,
  transaksi_id VARCHAR(36) NOT NULL,
  produk_id VARCHAR(36) NOT NULL,
  jumlah INT NOT NULL,
  FOREIGN KEY (transaksi_id) REFERENCES transactions(transaksi_id) ON DELETE CASCADE,
  FOREIGN KEY (produk_id) REFERENCES products(produk_id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_jenis ON products(jenis_produk);
CREATE INDEX idx_materials_stok ON materials(stok_saat_ini);
CREATE INDEX idx_material_orders_status ON material_orders(status);
CREATE INDEX idx_material_orders_bahan ON material_orders(bahan_id);
CREATE INDEX idx_material_orders_user ON material_orders(user_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_tanggal ON transactions(tanggal);
CREATE INDEX idx_transaction_items_transaksi ON transaction_items(transaksi_id);
CREATE INDEX idx_transaction_items_produk ON transaction_items(produk_id);
```

### Design Decisions

1. **Tabel Role Terpisah**: Menggunakan tabel `roles` terpisah untuk fleksibilitas penambahan role baru tanpa mengubah schema.

2. **Tidak Ada Tabel Supplier**: Sesuai ERD, pengadaan bahan baku tidak memerlukan supplier terpisah. Jika diperlukan di masa depan, bisa ditambahkan.

3. **Product-Material Junction Table**: Tabel `product_materials` memungkinkan tracking bahan baku yang digunakan per produk, berguna untuk kalkulasi stok otomatis.

4. **Simplified Transaction**: Transaksi hanya menyimpan `total_harga`, perhitungan subtotal dan tax dilakukan di application layer.

5. **Material Order Simplified**: Pengadaan bahan baku langsung per bahan (bukan per supplier dengan multiple items), sesuai ERD.

### Query Interfaces

```typescript
// lib/db/queries/roles.ts
interface RoleQuery {
  getAll(): Promise<Role[]>;
  getById(id: string): Promise<Role | null>;
  create(data: CreateRoleDTO): Promise<Role>;
  update(id: string, data: UpdateRoleDTO): Promise<Role>;
  delete(id: string): Promise<boolean>;
}

// lib/db/queries/users.ts
interface UserQuery {
  getAll(search?: string): Promise<User[]>;
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<UserWithPassword | null>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: string, data: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<boolean>;
}

// lib/db/queries/products.ts
interface ProductQuery {
  getAll(search?: string, jenisProduct?: string): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  getWithMaterials(id: string): Promise<ProductWithMaterials | null>;
  create(data: CreateProductDTO): Promise<Product>;
  update(id: string, data: UpdateProductDTO): Promise<Product>;
  delete(id: string): Promise<boolean>;
}

// lib/db/queries/materials.ts
interface MaterialQuery {
  getAll(search?: string): Promise<Material[]>;
  getById(id: string): Promise<Material | null>;
  getLowStock(): Promise<Material[]>;
  create(data: CreateMaterialDTO): Promise<Material>;
  update(id: string, data: UpdateMaterialDTO): Promise<Material>;
  delete(id: string): Promise<boolean>;
  updateStock(id: string, quantity: number): Promise<void>;
}

// lib/db/queries/product-materials.ts
interface ProductMaterialQuery {
  getByProductId(productId: string): Promise<ProductMaterial[]>;
  getByMaterialId(materialId: string): Promise<ProductMaterial[]>;
  create(data: CreateProductMaterialDTO): Promise<ProductMaterial>;
  update(productId: string, materialId: string, jumlah: number): Promise<ProductMaterial>;
  delete(productId: string, materialId: string): Promise<boolean>;
}

// lib/db/queries/orders.ts (Pengadaan Bahan Baku)
interface MaterialOrderQuery {
  getAll(search?: string): Promise<MaterialOrder[]>;
  getById(id: string): Promise<MaterialOrder | null>;
  create(data: CreateMaterialOrderDTO): Promise<MaterialOrder>;
  updateStatus(id: string, status: string, tanggalTerima?: Date): Promise<MaterialOrder>;
}

// lib/db/queries/transactions.ts
interface TransactionQuery {
  getAll(startDate?: Date, endDate?: Date): Promise<Transaction[]>;
  getById(id: string): Promise<TransactionWithItems | null>;
  create(data: CreateTransactionDTO): Promise<Transaction>;
}

// lib/db/queries/dashboard.ts
interface DashboardQuery {
  getStats(): Promise<DashboardStats>;
  getWeeklySales(): Promise<WeeklySalesData[]>;
  getTopProducts(limit?: number): Promise<TopProduct[]>;
}

interface DashboardStats {
  totalSales: number;
  todayTransactions: number;
  activeEmployees: number;
  productsSold: number;
}

interface WeeklySalesData {
  day: string;
  sales: number;
}

interface TopProduct {
  produk_id: string;
  nama_produk: string;
  jenis_produk: string;
  totalSold: number;
  revenue: number;
}

// lib/db/queries/reports.ts
interface ReportsQuery {
  getSummary(period: 'daily' | 'weekly' | 'monthly'): Promise<ReportSummary>;
  getRevenueExpense(months?: number): Promise<RevenueExpenseData[]>;
  getCategorySales(): Promise<CategorySalesData[]>;
}

interface ReportSummary {
  revenue: number;
  expenses: number;
  profit: number;
  transactions: number;
  period: string;
}

interface RevenueExpenseData {
  month: string;
  revenue: number;
  expense: number;
}

interface CategorySalesData {
  jenis_produk: string;
  percentage: number;
  total: number;
}
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login dengan email dan password |
| POST | /api/auth/logout | Logout dan invalidate token |
| GET | /api/auth/me | Get current user data |

### Roles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/roles | Get all roles |
| GET | /api/roles/[id] | Get role by ID |
| POST | /api/roles | Create new role |
| PUT | /api/roles/[id] | Update role |
| DELETE | /api/roles/[id] | Delete role |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | Get all products (with search & jenis_produk filter) |
| GET | /api/products/[id] | Get product by ID |
| POST | /api/products | Create new product |
| PUT | /api/products/[id] | Update product |
| DELETE | /api/products/[id] | Delete product |
| GET | /api/products/[id]/materials | Get materials used by product |
| POST | /api/products/[id]/materials | Add material to product |

### Materials (Bahan Baku)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/materials | Get all materials (with search filter) |
| GET | /api/materials/[id] | Get material by ID |
| GET | /api/materials/low-stock | Get materials with stok_saat_ini < stok_minimum |
| POST | /api/materials | Create new material |
| PUT | /api/materials/[id] | Update material |
| DELETE | /api/materials/[id] | Delete material |

### Employees (Pegawai/Users)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/employees | Get all employees (with search filter) |
| GET | /api/employees/[id] | Get employee by ID |
| POST | /api/employees | Create new employee |
| PUT | /api/employees/[id] | Update employee |
| DELETE | /api/employees/[id] | Delete employee |

### Transactions (Transaksi Penjualan)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/transactions | Get all transactions (with date filter) |
| GET | /api/transactions/[id] | Get transaction with items (Detail Penjualan) |
| POST | /api/transactions | Create new transaction |

### Material Orders (Pengadaan Bahan Baku)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/orders | Get all material orders (with search filter) |
| GET | /api/orders/[id] | Get order detail |
| POST | /api/orders | Create new material order |
| PUT | /api/orders/[id] | Update order status (and tanggal_terima) |

### Dashboard & Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/stats | Get dashboard statistics |
| GET | /api/dashboard/weekly-sales | Get weekly sales data |
| GET | /api/dashboard/top-products | Get top selling products |
| GET | /api/reports/summary | Get report summary (with period filter) |
| GET | /api/reports/revenue-expense | Get revenue vs expense data |
| GET | /api/reports/category-sales | Get sales by jenis_produk |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: CRUD Round Trip

*For any* entity (Role, Product, Material, Employee), creating an entity then retrieving it by ID should return the same data that was created.

**Validates: Requirements 3.4, 4.3, 5.3**

### Property 2: Search Filter Correctness

*For any* search query string and any list of entities, all items returned by the search endpoint should contain the query string (case-insensitive) in their searchable fields.

**Validates: Requirements 3.2, 4.2, 5.2, 7.2**

### Property 3: Jenis Produk Filter Correctness

*For any* jenis_produk filter value, all products returned should have their jenis_produk field matching the selected value.

**Validates: Requirements 3.3**

### Property 4: Transaction Total Correctness

*For any* transaction with items, the total_harga should equal the sum of (product.harga × jumlah) for all items in Detail Penjualan.

**Validates: Requirements 6.5**

### Property 5: Material Stock Update on Order Receipt

*For any* material order with status changed to 'Diterima', the material's stok_saat_ini should be increased by the order's jumlah.

**Validates: Requirements 7.4, 8.3**

### Property 6: Material Status Derivation

*For any* material, if stok_saat_ini >= stok_minimum then status should be "Aman", otherwise status should be "Stok Rendah".

**Validates: Requirements 4.7**

### Property 7: Password Exclusion

*For any* API response containing employee/user data, the password field should never be included in the response.

**Validates: Requirements 5.6**

### Property 8: Authentication Round Trip

*For any* valid user credentials, logging in then calling /api/auth/me should return the same user data.

**Validates: Requirements 2.1, 2.4**

### Property 9: Invalid Token Rejection

*For any* invalid or expired token, all protected endpoints should return status 401.

**Validates: Requirements 2.5**

### Property 10: Product-Material Relationship Integrity

*For any* product with associated materials in product_materials table, deleting the product should also remove all related entries in product_materials.

**Validates: Requirements 3.6**

### Property 11: Role Reference Integrity

*For any* user, the role_id must reference a valid entry in the roles table.

**Validates: Requirements 5.3**

### Property 12: Consistent JSON Response Format

*For any* API response (success or error), the response body should always contain a `success` boolean field, and optionally `data` (on success) or `error` (on failure).

**Validates: Requirements 11.5**

## Error Handling

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid/missing token |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry (e.g., email) |
| 500 | Internal Server Error | Database/server errors |

### Error Response Format

```typescript
{
  success: false,
  error: "Error message here",
  details?: {
    field: "fieldName",
    message: "Specific validation error"
  }[]
}
```

### Validation Errors

- Empty required fields: "Field [fieldName] wajib diisi"
- Invalid email format: "Format email tidak valid"
- Invalid phone format: "Format nomor telepon tidak valid"
- Duplicate email: "Email sudah terdaftar"
- Insufficient stock: "Stok produk [productName] tidak mencukupi"
- Invalid credentials: "Email atau password salah"

## Testing Strategy

### Unit Tests
- Database query functions
- Utility functions (JWT, password hashing, response formatting)
- Validation schemas

### Integration Tests
- API endpoint tests with test database
- Authentication flow tests
- Transaction flow tests
- Material order flow tests (including stock updates on receipt)

### Property-Based Tests
Property-based tests will verify universal properties using fast-check library:
- CRUD round-trip for all entities
- Search filter correctness
- Jenis produk filter correctness
- Transaction total calculations
- Material stock updates
- Status derivations
- Password exclusion
- Consistent JSON response format

### Test Configuration
- Framework: Jest
- Property Testing: fast-check
- Database: Separate test database
- Minimum 100 iterations per property test
- Each property test tagged with: **Feature: backend-mysql, Property {number}: {property_text}**

### Test File Structure
```
__tests__/
├── api/
│   ├── auth.test.ts
│   ├── roles.test.ts
│   ├── products.test.ts
│   ├── materials.test.ts
│   ├── employees.test.ts
│   ├── transactions.test.ts
│   ├── orders.test.ts
│   ├── dashboard.test.ts
│   └── reports.test.ts
├── db/
│   └── queries.test.ts
├── utils/
│   ├── jwt.test.ts
│   └── password.test.ts
└── properties/
    ├── crud.property.test.ts
    ├── search.property.test.ts
    ├── transaction.property.test.ts
    ├── status.property.test.ts
    └── response.property.test.ts
```
