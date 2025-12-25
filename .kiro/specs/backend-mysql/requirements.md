# Requirements Document

## Introduction

Backend API untuk Aplikasi Manajemen Cafe Merah Putih menggunakan Next.js API Routes sebagai fullstack solution dengan MySQL sebagai database. Backend ini akan menggantikan local storage yang saat ini digunakan untuk menyimpan data, menyediakan API endpoints untuk semua operasi CRUD pada setiap modul aplikasi.

## Glossary

- **API**: Application Programming Interface - endpoint yang menyediakan akses ke data dan operasi
- **Sistem**: Backend API Cafe Merah Putih
- **Database**: MySQL database untuk penyimpanan data persisten
- **Endpoint**: URL path yang menerima request HTTP
- **CRUD**: Create, Read, Update, Delete - operasi dasar pada data
- **Prisma**: ORM (Object-Relational Mapping) untuk interaksi dengan MySQL
- **JWT**: JSON Web Token untuk autentikasi
- **Session**: Sesi pengguna yang terautentikasi

## Requirements

### Requirement 1: Database Setup dan Koneksi

**User Story:** Sebagai developer, saya ingin database MySQL terkonfigurasi dengan benar, sehingga aplikasi dapat menyimpan data secara persisten.

#### Acceptance Criteria

1. THE Sistem SHALL menggunakan mysql2 library untuk koneksi langsung ke MySQL
2. THE Sistem SHALL memiliki schema database (SQL file) yang mencakup semua entity: User, Product, Material, Transaction, MaterialOrder, StockReceipt, Supplier
3. WHEN aplikasi dijalankan, THEN Sistem SHALL membuat connection pool ke MySQL database
4. IF koneksi database gagal, THEN Sistem SHALL menampilkan error message yang jelas
5. THE Sistem SHALL menyediakan SQL migration file untuk setup database awal
6. THE Sistem SHALL menggunakan prepared statements untuk mencegah SQL injection

### Requirement 2: API Autentikasi

**User Story:** Sebagai pengguna, saya ingin login dan logout melalui API, sehingga sesi saya aman dan terkelola dengan baik.

#### Acceptance Criteria

1. WHEN pengguna mengirim POST request ke /api/auth/login dengan email dan password valid, THEN Sistem SHALL mengembalikan token autentikasi dan data user
2. WHEN pengguna mengirim kredensial tidak valid, THEN Sistem SHALL mengembalikan status 401 dengan pesan error
3. WHEN pengguna mengirim POST request ke /api/auth/logout, THEN Sistem SHALL mengakhiri sesi
4. WHEN pengguna mengirim GET request ke /api/auth/me dengan token valid, THEN Sistem SHALL mengembalikan data user yang sedang login
5. IF token tidak valid atau expired, THEN Sistem SHALL mengembalikan status 401

### Requirement 3: API Produk

**User Story:** Sebagai pengguna, saya ingin mengelola data produk melalui API, sehingga data produk tersimpan di database.

#### Acceptance Criteria

1. WHEN pengguna mengirim GET request ke /api/products, THEN Sistem SHALL mengembalikan daftar semua produk
2. WHEN pengguna mengirim GET request ke /api/products dengan query parameter search, THEN Sistem SHALL memfilter produk berdasarkan nama
3. WHEN pengguna mengirim GET request ke /api/products dengan query parameter category, THEN Sistem SHALL memfilter produk berdasarkan kategori
4. WHEN pengguna mengirim POST request ke /api/products dengan data valid, THEN Sistem SHALL membuat produk baru dan mengembalikan data produk
5. WHEN pengguna mengirim PUT request ke /api/products/[id], THEN Sistem SHALL mengupdate produk dan mengembalikan data terbaru
6. WHEN pengguna mengirim DELETE request ke /api/products/[id], THEN Sistem SHALL menghapus produk
7. THE Sistem SHALL menghitung status produk (Tersedia/Habis) berdasarkan stok

### Requirement 4: API Bahan Baku

**User Story:** Sebagai pengguna, saya ingin mengelola data bahan baku melalui API, sehingga stok bahan baku terpantau dengan baik.

#### Acceptance Criteria

1. WHEN pengguna mengirim GET request ke /api/materials, THEN Sistem SHALL mengembalikan daftar semua bahan baku
2. WHEN pengguna mengirim GET request ke /api/materials dengan query parameter search, THEN Sistem SHALL memfilter bahan baku berdasarkan nama
3. WHEN pengguna mengirim POST request ke /api/materials dengan data valid, THEN Sistem SHALL membuat bahan baku baru
4. WHEN pengguna mengirim PUT request ke /api/materials/[id], THEN Sistem SHALL mengupdate bahan baku
5. WHEN pengguna mengirim DELETE request ke /api/materials/[id], THEN Sistem SHALL menghapus bahan baku
6. WHEN pengguna mengirim GET request ke /api/materials/low-stock, THEN Sistem SHALL mengembalikan daftar bahan baku dengan stok di bawah minimum
7. THE Sistem SHALL menghitung status bahan baku (Aman/Stok Rendah) berdasarkan stok dan minStock

### Requirement 5: API Pegawai

**User Story:** Sebagai manager, saya ingin mengelola data pegawai melalui API, sehingga data karyawan tersimpan dengan aman.

#### Acceptance Criteria

1. WHEN pengguna mengirim GET request ke /api/employees, THEN Sistem SHALL mengembalikan daftar semua pegawai
2. WHEN pengguna mengirim GET request ke /api/employees dengan query parameter search, THEN Sistem SHALL memfilter pegawai berdasarkan nama
3. WHEN pengguna mengirim POST request ke /api/employees dengan data valid, THEN Sistem SHALL membuat pegawai baru dengan password ter-hash
4. WHEN pengguna mengirim PUT request ke /api/employees/[id], THEN Sistem SHALL mengupdate data pegawai
5. WHEN pengguna mengirim DELETE request ke /api/employees/[id], THEN Sistem SHALL menghapus pegawai
6. THE Sistem SHALL tidak mengembalikan password dalam response

### Requirement 6: API Transaksi

**User Story:** Sebagai kasir, saya ingin menyimpan transaksi penjualan melalui API, sehingga data penjualan tercatat di database.

#### Acceptance Criteria

1. WHEN pengguna mengirim GET request ke /api/transactions, THEN Sistem SHALL mengembalikan daftar transaksi
2. WHEN pengguna mengirim GET request ke /api/transactions dengan query parameter date, THEN Sistem SHALL memfilter transaksi berdasarkan tanggal
3. WHEN pengguna mengirim POST request ke /api/transactions dengan data valid, THEN Sistem SHALL membuat transaksi baru dan mengurangi stok produk
4. WHEN pengguna mengirim GET request ke /api/transactions/[id], THEN Sistem SHALL mengembalikan detail transaksi dengan items
5. THE Sistem SHALL menghitung subtotal, tax (10%), dan total secara otomatis
6. IF stok produk tidak mencukupi, THEN Sistem SHALL mengembalikan error

### Requirement 7: API Pemesanan Bahan

**User Story:** Sebagai pengguna, saya ingin mengelola pesanan bahan baku melalui API, sehingga pemesanan tercatat dengan baik.

#### Acceptance Criteria

1. WHEN pengguna mengirim GET request ke /api/orders, THEN Sistem SHALL mengembalikan daftar pesanan bahan
2. WHEN pengguna mengirim GET request ke /api/orders dengan query parameter search, THEN Sistem SHALL memfilter pesanan berdasarkan ID atau supplier
3. WHEN pengguna mengirim POST request ke /api/orders dengan data valid, THEN Sistem SHALL membuat pesanan baru
4. WHEN pengguna mengirim PUT request ke /api/orders/[id], THEN Sistem SHALL mengupdate status pesanan
5. WHEN pengguna mengirim GET request ke /api/orders/[id], THEN Sistem SHALL mengembalikan detail pesanan dengan items

### Requirement 8: API Penerimaan Stok

**User Story:** Sebagai pengguna, saya ingin mencatat penerimaan stok melalui API, sehingga stok bahan baku terupdate otomatis.

#### Acceptance Criteria

1. WHEN pengguna mengirim GET request ke /api/receipts, THEN Sistem SHALL mengembalikan daftar penerimaan stok
2. WHEN pengguna mengirim GET request ke /api/receipts dengan query parameter search, THEN Sistem SHALL memfilter penerimaan berdasarkan ID
3. WHEN pengguna mengirim POST request ke /api/receipts dengan data valid, THEN Sistem SHALL membuat penerimaan baru dan menambah stok bahan baku
4. WHEN pengguna mengirim GET request ke /api/receipts/[id], THEN Sistem SHALL mengembalikan detail penerimaan
5. THE Sistem SHALL menghitung status penerimaan (Lengkap/Sebagian) berdasarkan quantity yang diterima vs dipesan

### Requirement 9: API Dashboard dan Laporan

**User Story:** Sebagai manager, saya ingin melihat statistik dan laporan melalui API, sehingga saya dapat menganalisis performa bisnis.

#### Acceptance Criteria

1. WHEN pengguna mengirim GET request ke /api/dashboard/stats, THEN Sistem SHALL mengembalikan statistik: total penjualan, transaksi hari ini, pegawai aktif, produk terjual
2. WHEN pengguna mengirim GET request ke /api/dashboard/weekly-sales, THEN Sistem SHALL mengembalikan data penjualan mingguan
3. WHEN pengguna mengirim GET request ke /api/dashboard/top-products, THEN Sistem SHALL mengembalikan produk terlaris
4. WHEN pengguna mengirim GET request ke /api/reports/summary dengan parameter periode, THEN Sistem SHALL mengembalikan ringkasan laporan
5. WHEN pengguna mengirim GET request ke /api/reports/revenue-expense, THEN Sistem SHALL mengembalikan data pendapatan vs pengeluaran
6. WHEN pengguna mengirim GET request ke /api/reports/category-sales, THEN Sistem SHALL mengembalikan penjualan per kategori

### Requirement 10: API Supplier

**User Story:** Sebagai pengguna, saya ingin mengelola data supplier melalui API, sehingga informasi supplier tersimpan dengan baik.

#### Acceptance Criteria

1. WHEN pengguna mengirim GET request ke /api/suppliers, THEN Sistem SHALL mengembalikan daftar semua supplier
2. WHEN pengguna mengirim POST request ke /api/suppliers dengan data valid, THEN Sistem SHALL membuat supplier baru
3. WHEN pengguna mengirim PUT request ke /api/suppliers/[id], THEN Sistem SHALL mengupdate data supplier
4. WHEN pengguna mengirim DELETE request ke /api/suppliers/[id], THEN Sistem SHALL menghapus supplier

### Requirement 11: Error Handling dan Validasi

**User Story:** Sebagai developer, saya ingin API memiliki error handling yang konsisten, sehingga debugging dan maintenance lebih mudah.

#### Acceptance Criteria

1. WHEN request body tidak valid, THEN Sistem SHALL mengembalikan status 400 dengan detail error
2. WHEN resource tidak ditemukan, THEN Sistem SHALL mengembalikan status 404
3. WHEN terjadi server error, THEN Sistem SHALL mengembalikan status 500 dengan pesan generic
4. THE Sistem SHALL memvalidasi semua input sebelum menyimpan ke database
5. THE Sistem SHALL mengembalikan response dalam format JSON yang konsisten: { success: boolean, data?: any, error?: string }
