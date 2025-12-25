# Implementation Plan: Cafe Merah Putih Management System

## Overview

Implementasi aplikasi manajemen cafe dengan Next.js 16.1.1, menggunakan pendekatan incremental dari setup dasar hingga fitur lengkap. Setiap task membangun di atas task sebelumnya.

## Tasks

- [x] 1. Setup project structure dan dependencies
  - Install dependencies: recharts, lucide-react
  - Setup folder structure (components, lib, types)
  - Konfigurasi Tailwind CSS dengan tema merah-putih
  - _Requirements: 10.5_

- [x] 2. Implement core UI components
  - [x] 2.1 Create Button component dengan variants (primary, secondary, danger, ghost)
    - Implement styling dengan tema merah (#DC2626)
    - _Requirements: 10.5_
  - [x] 2.2 Create Card component
    - _Requirements: 10.5_
  - [x] 2.3 Create Input dan SearchInput components
    - _Requirements: 3.2, 4.2, 6.2, 7.2, 8.2, 9.2_
  - [x] 2.4 Create Badge component dengan variants (success, warning, danger)
    - _Requirements: 6.5, 7.5, 8.7, 9.7_
  - [x] 2.5 Create Table component
    - _Requirements: 6.1, 7.1, 8.1, 9.1_
  - [x] 2.6 Create Modal component
    - _Requirements: 4.3, 4.4, 8.4, 8.5, 9.3, 9.4_

- [x] 3. Implement types dan mock data
  - [x] 3.1 Create TypeScript interfaces untuk semua entities
    - User, Product, Material, Transaction, MaterialOrder, StockReceipt
    - _Requirements: All_
  - [x] 3.2 Create mock data untuk development
    - Sample products, employees, materials, transactions
    - _Requirements: All_

- [x] 4. Implement layout dan navigation
  - [x] 4.1 Create Sidebar component dengan menu items
    - Logo Caffe Merah Putih
    - Menu: Dashboard, Transaksi, Pegawai, Laporan, Pemesanan Bahan, Penerimaan Stok, Data Produk, Data Bahan Baku, Keluar
    - Active state dengan background merah
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  - [x] 4.2 Create dashboard layout dengan sidebar
    - _Requirements: 10.1_

- [x] 5. Implement authentication
  - [x] 5.1 Create AuthContext untuk state management
    - _Requirements: 1.5_
  - [x] 5.2 Create login page dengan form
    - Email dan password fields
    - Error handling untuk invalid credentials
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 5.3 Implement auth service dengan local storage
    - Login, logout, session check functions
    - _Requirements: 1.2, 1.4, 1.5_
  - [x] 5.4 Create auth middleware untuk protected routes
    - Redirect ke login jika tidak authenticated
    - _Requirements: 1.1_
  - [ ]*5.5 Write property test untuk authentication state
    - **Property 8: Authentication State Correctness**
    - **Validates: Requirements 1.1, 1.5**

- [x] 6. Checkpoint - Ensure auth dan layout berfungsi
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Dashboard page
  - [x] 7.1 Create StatCard component
    - Icon, value, title, percentage change
    - _Requirements: 2.1, 2.4_
  - [x] 7.2 Create WeeklySalesChart dengan Recharts AreaChart
    - _Requirements: 2.2_
  - [x] 7.3 Create TopProductsChart dengan horizontal BarChart
    - _Requirements: 2.3_
  - [x] 7.4 Assemble Dashboard page dengan semua components
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 8. Implement Data Produk page
  - [x] 8.1 Create products service (CRUD operations)
    - _Requirements: 8.4, 8.5, 8.6_
  - [x] 8.2 Create ProductTable component dengan search dan filter
    - _Requirements: 8.1, 8.2, 8.3_
  - [x] 8.3 Create ProductForm modal untuk add/edit
    - _Requirements: 8.4, 8.5_
  - [x] 8.4 Implement product status derivation (Tersedia/Habis)
    - _Requirements: 8.7_
  - [ ]*8.5 Write property test untuk search filter
    - **Property 1: Search Filter Correctness**
    - **Validates: Requirements 8.2**
  - [ ]*8.6 Write property test untuk category filter
    - **Property 2: Category Filter Correctness**
    - **Validates: Requirements 8.3**
  - [ ]*8.7 Write property test untuk product status
    - **Property 5: Product Status Derivation**
    - **Validates: Requirements 8.7**

- [x] 9. Implement Data Bahan Baku page
  - [x] 9.1 Create materials service (CRUD operations)
    - _Requirements: 9.3, 9.4, 9.5_
  - [x] 9.2 Create MaterialTable component dengan search
    - _Requirements: 9.1, 9.2_
  - [x] 9.3 Create MaterialForm modal untuk add/edit
    - _Requirements: 9.3, 9.4_
  - [x] 9.4 Create LowStockAlert component
    - _Requirements: 9.6_
  - [x] 9.5 Implement material status derivation (Aman/Stok Rendah)
    - _Requirements: 9.7_
  - [ ]*9.6 Write property test untuk material status
    - **Property 6: Material Status Derivation**
    - **Validates: Requirements 9.7**
  - [ ]*9.7 Write property test untuk low stock alert
    - **Property 7: Low Stock Alert Correctness**
    - **Validates: Requirements 9.6**

- [x] 10. Checkpoint - Ensure produk dan bahan baku berfungsi
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement Transaksi Penjualan (POS) page
  - [x] 11.1 Create ProductGrid component untuk display produk
    - Card layout dengan nama, kategori, harga
    - _Requirements: 3.1_
  - [x] 11.2 Create Cart component
    - Item list, quantity controls, subtotal, tax, total
    - _Requirements: 3.5, 3.7_
  - [x] 11.3 Create cart service dengan calculation logic
    - Add item, remove item, update quantity, calculate totals
    - _Requirements: 3.4, 3.5_
  - [x] 11.4 Create transactions service untuk save transactions
    - _Requirements: 3.6_
  - [x] 11.5 Assemble Transaksi page dengan search dan category filter
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ]*11.6 Write property test untuk cart calculation
    - **Property 3: Cart Calculation Correctness**
    - **Validates: Requirements 3.5**
  - [ ]*11.7 Write property test untuk cart addition
    - **Property 4: Cart Addition Correctness**
    - **Validates: Requirements 3.4**
  - [ ]*11.8 Write property test untuk transaction persistence
    - **Property 10: Transaction Persistence**
    - **Validates: Requirements 3.6**

- [x] 12. Implement Kelola Pegawai page
  - [x] 12.1 Create employees service (CRUD operations)
    - _Requirements: 4.3, 4.5_
  - [x] 12.2 Create EmployeeCard component
    - Display nama, email, role, status, phone
    - Edit dan delete buttons
    - _Requirements: 4.1, 4.6_
  - [x] 12.3 Create EmployeeForm modal untuk add/edit
    - _Requirements: 4.3, 4.4_
  - [x] 12.4 Assemble Pegawai page dengan search
    - _Requirements: 4.1, 4.2_
  - [ ]*12.5 Write property test untuk employee data display
    - **Property 9: Employee Data Display Completeness**
    - **Validates: Requirements 4.6**

- [x] 13. Checkpoint - Ensure transaksi dan pegawai berfungsi
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Implement Laporan page
  - [x] 14.1 Create ReportStatCard component
    - _Requirements: 5.1_
  - [x] 14.2 Create RevenueExpenseChart dengan LineChart
    - _Requirements: 5.2_
  - [x] 14.3 Create CategorySalesChart dengan DonutChart
    - _Requirements: 5.3_
  - [x] 14.4 Create period filter dropdown
    - _Requirements: 5.4_
  - [x] 14.5 Assemble Laporan page
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 15. Implement Pemesanan Bahan page
  - [x] 15.1 Create orders service (CRUD operations)
    - _Requirements: 6.3_
  - [x] 15.2 Create OrdersTable component
    - _Requirements: 6.1_
  - [x] 15.3 Create OrderForm modal
    - _Requirements: 6.3_
  - [x] 15.4 Create OrderDetail modal
    - _Requirements: 6.4_
  - [x] 15.5 Assemble Pemesanan Bahan page dengan search
    - _Requirements: 6.1, 6.2, 6.5_

- [x] 16. Implement Penerimaan Stok page
  - [x] 16.1 Create receipts service (CRUD operations)
    - _Requirements: 7.3_
  - [x] 16.2 Create ReceiptsTable component
    - _Requirements: 7.1_
  - [x] 16.3 Create ReceiptForm modal
    - _Requirements: 7.3_
  - [x] 16.4 Create ReceiptDetail modal
    - _Requirements: 7.4_
  - [x] 16.5 Assemble Penerimaan Stok page dengan search
    - _Requirements: 7.1, 7.2, 7.5_

- [x] 17. Final checkpoint - Full integration test
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all pages accessible dan functional
  - Verify navigation works correctly
  - Verify auth flow complete

## Notes

- Tasks marked with `*` are optional property-based tests
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Local storage digunakan untuk data persistence (dapat di-upgrade ke API)
