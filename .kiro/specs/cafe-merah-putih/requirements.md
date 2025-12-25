# Requirements Document

## Introduction

Aplikasi Manajemen Cafe Merah Putih adalah sistem manajemen cafe berbasis web yang memungkinkan pengelolaan operasional cafe secara menyeluruh, termasuk transaksi penjualan, manajemen stok, pengelolaan pegawai, dan pelaporan bisnis. Aplikasi menggunakan tema warna merah-putih dengan desain modern dan user-friendly.

## Glossary

- **Sistem**: Aplikasi Manajemen Cafe Merah Putih
- **Pengguna**: Pegawai cafe yang menggunakan aplikasi (Kasir, Barista, Manager)
- **Produk**: Menu minuman dan makanan yang dijual di cafe
- **Bahan_Baku**: Material mentah yang digunakan untuk membuat produk
- **Transaksi**: Proses penjualan produk kepada pelanggan
- **Keranjang**: Daftar produk yang dipilih sebelum pembayaran
- **Supplier**: Penyedia bahan baku untuk cafe
- **Pesanan_Bahan**: Order pembelian bahan baku ke supplier
- **Penerimaan_Stok**: Pencatatan bahan baku yang diterima dari supplier

## Requirements

### Requirement 1: Autentikasi Pengguna

**User Story:** Sebagai pengguna, saya ingin login ke sistem dengan kredensial yang valid, sehingga saya dapat mengakses fitur sesuai peran saya.

#### Acceptance Criteria

1. WHEN pengguna mengakses aplikasi tanpa autentikasi, THEN Sistem SHALL menampilkan halaman login
2. WHEN pengguna memasukkan email dan password yang valid, THEN Sistem SHALL mengautentikasi dan mengarahkan ke Dashboard
3. WHEN pengguna memasukkan kredensial yang tidak valid, THEN Sistem SHALL menampilkan pesan error yang jelas
4. WHEN pengguna menekan tombol "Keluar", THEN Sistem SHALL mengakhiri sesi dan mengarahkan ke halaman login
5. THE Sistem SHALL menyimpan sesi pengguna yang terautentikasi

### Requirement 2: Dashboard

**User Story:** Sebagai pengguna, saya ingin melihat ringkasan bisnis di dashboard, sehingga saya dapat memantau performa cafe dengan cepat.

#### Acceptance Criteria

1. WHEN pengguna mengakses Dashboard, THEN Sistem SHALL menampilkan kartu statistik: Total Penjualan, Transaksi Hari Ini, Pegawai Aktif, dan Produk Terjual
2. WHEN pengguna mengakses Dashboard, THEN Sistem SHALL menampilkan grafik Penjualan Mingguan dalam bentuk area chart
3. WHEN pengguna mengakses Dashboard, THEN Sistem SHALL menampilkan chart Produk Terlaris dalam bentuk horizontal bar chart
4. THE Sistem SHALL menampilkan persentase perubahan dibanding periode sebelumnya pada setiap kartu statistik

### Requirement 3: Transaksi Penjualan (POS)

**User Story:** Sebagai kasir, saya ingin membuat transaksi penjualan dengan mudah, sehingga saya dapat melayani pelanggan dengan cepat.

#### Acceptance Criteria

1. WHEN pengguna mengakses halaman Transaksi Penjualan, THEN Sistem SHALL menampilkan daftar produk dalam bentuk grid cards
2. WHEN pengguna mengetik di kolom pencarian, THEN Sistem SHALL memfilter produk berdasarkan nama
3. WHEN pengguna memilih filter kategori (Semua/Kopi/Non-Kopi/Makanan), THEN Sistem SHALL menampilkan produk sesuai kategori
4. WHEN pengguna mengklik produk, THEN Sistem SHALL menambahkan produk ke keranjang
5. WHEN produk ditambahkan ke keranjang, THEN Sistem SHALL menghitung subtotal, pajak (10%), dan total
6. WHEN pengguna menekan "Bayar Sekarang", THEN Sistem SHALL memproses transaksi dan menyimpan ke database
7. IF keranjang kosong, THEN Sistem SHALL menonaktifkan tombol "Bayar Sekarang"

### Requirement 4: Kelola Pegawai

**User Story:** Sebagai manager, saya ingin mengelola data pegawai, sehingga saya dapat mengatur akses dan informasi karyawan.

#### Acceptance Criteria

1. WHEN pengguna mengakses halaman Kelola Pegawai, THEN Sistem SHALL menampilkan daftar pegawai dalam bentuk cards
2. WHEN pengguna mengetik di kolom pencarian, THEN Sistem SHALL memfilter pegawai berdasarkan nama
3. WHEN pengguna menekan "Tambah Pegawai", THEN Sistem SHALL menampilkan form untuk menambah pegawai baru
4. WHEN pengguna menekan "Edit" pada card pegawai, THEN Sistem SHALL menampilkan form edit dengan data pegawai
5. WHEN pengguna menekan tombol hapus pada card pegawai, THEN Sistem SHALL menampilkan konfirmasi dan menghapus pegawai
6. THE Sistem SHALL menampilkan informasi pegawai: nama, email, role, status (Aktif/Nonaktif), dan nomor telepon

### Requirement 5: Laporan

**User Story:** Sebagai manager, saya ingin melihat laporan bisnis, sehingga saya dapat menganalisis performa cafe.

#### Acceptance Criteria

1. WHEN pengguna mengakses halaman Laporan, THEN Sistem SHALL menampilkan kartu ringkasan: Total Pendapatan, Total Pengeluaran, Laba Bersih, dan Total Transaksi
2. WHEN pengguna mengakses halaman Laporan, THEN Sistem SHALL menampilkan grafik Pendapatan vs Pengeluaran dalam bentuk line chart
3. WHEN pengguna mengakses halaman Laporan, THEN Sistem SHALL menampilkan chart Penjualan per Kategori dalam bentuk donut chart
4. WHEN pengguna memilih periode waktu, THEN Sistem SHALL memfilter data laporan sesuai periode
5. WHEN pengguna menekan tombol "Export", THEN Sistem SHALL mengunduh laporan dalam format yang sesuai

### Requirement 6: Pemesanan Bahan Baku

**User Story:** Sebagai pengguna, saya ingin membuat pesanan bahan baku ke supplier, sehingga stok bahan baku tetap terjaga.

#### Acceptance Criteria

1. WHEN pengguna mengakses halaman Pemesanan Bahan, THEN Sistem SHALL menampilkan tabel daftar pesanan dengan kolom: ID Pesanan, Tanggal, Supplier, Total, Status, dan Aksi
2. WHEN pengguna mengetik di kolom pencarian, THEN Sistem SHALL memfilter pesanan berdasarkan ID atau supplier
3. WHEN pengguna menekan "Buat Pesanan", THEN Sistem SHALL menampilkan form untuk membuat pesanan baru
4. WHEN pengguna menekan "Detail" pada baris pesanan, THEN Sistem SHALL menampilkan detail lengkap pesanan
5. THE Sistem SHALL menampilkan status pesanan dengan badge berwarna: Diterima (hijau), Dikirim (kuning), Pending (merah)

### Requirement 7: Penerimaan Stok

**User Story:** Sebagai pengguna, saya ingin mencatat penerimaan bahan baku dari supplier, sehingga stok tercatat dengan akurat.

#### Acceptance Criteria

1. WHEN pengguna mengakses halaman Penerimaan Stok, THEN Sistem SHALL menampilkan tabel daftar penerimaan dengan kolom: ID Penerimaan, Tanggal, ID Pesanan, Supplier, Status, dan Detail
2. WHEN pengguna mengetik di kolom pencarian, THEN Sistem SHALL memfilter penerimaan berdasarkan ID
3. WHEN pengguna menekan "Catat Penerimaan", THEN Sistem SHALL menampilkan form untuk mencatat penerimaan baru
4. WHEN pengguna menekan "Lihat Detail", THEN Sistem SHALL menampilkan detail lengkap penerimaan
5. THE Sistem SHALL menampilkan status penerimaan: Lengkap (hijau), Sebagian (kuning)

### Requirement 8: Data Produk

**User Story:** Sebagai pengguna, saya ingin mengelola data produk cafe, sehingga menu selalu up-to-date.

#### Acceptance Criteria

1. WHEN pengguna mengakses halaman Data Produk, THEN Sistem SHALL menampilkan tabel produk dengan kolom: Produk, Kategori, Harga, Stok, Status, dan Aksi
2. WHEN pengguna mengetik di kolom pencarian, THEN Sistem SHALL memfilter produk berdasarkan nama
3. WHEN pengguna memilih filter kategori, THEN Sistem SHALL menampilkan produk sesuai kategori
4. WHEN pengguna menekan "Tambah Produk", THEN Sistem SHALL menampilkan form untuk menambah produk baru
5. WHEN pengguna menekan tombol edit pada baris produk, THEN Sistem SHALL menampilkan form edit produk
6. WHEN pengguna menekan tombol hapus pada baris produk, THEN Sistem SHALL menampilkan konfirmasi dan menghapus produk
7. THE Sistem SHALL menampilkan status produk: Tersedia (hijau), Habis (merah)

### Requirement 9: Data Bahan Baku

**User Story:** Sebagai pengguna, saya ingin mengelola data bahan baku, sehingga stok bahan baku terpantau dengan baik.

#### Acceptance Criteria

1. WHEN pengguna mengakses halaman Data Bahan Baku, THEN Sistem SHALL menampilkan tabel bahan baku dengan kolom: Bahan Baku, Kategori, Stok, Min. Stok, Supplier, Status, dan Aksi
2. WHEN pengguna mengetik di kolom pencarian, THEN Sistem SHALL memfilter bahan baku berdasarkan nama
3. WHEN pengguna menekan "Tambah Bahan", THEN Sistem SHALL menampilkan form untuk menambah bahan baku baru
4. WHEN pengguna menekan tombol edit pada baris bahan baku, THEN Sistem SHALL menampilkan form edit bahan baku
5. WHEN pengguna menekan tombol hapus pada baris bahan baku, THEN Sistem SHALL menampilkan konfirmasi dan menghapus bahan baku
6. IF stok bahan baku di bawah minimum, THEN Sistem SHALL menampilkan alert peringatan di bagian atas halaman
7. THE Sistem SHALL menampilkan status stok: Aman (hijau), Stok Rendah (merah)

### Requirement 10: Navigasi dan Layout

**User Story:** Sebagai pengguna, saya ingin navigasi yang konsisten dan mudah digunakan, sehingga saya dapat berpindah antar fitur dengan cepat.

#### Acceptance Criteria

1. THE Sistem SHALL menampilkan sidebar navigasi di sisi kiri dengan logo "Caffe Merah Putih"
2. THE Sistem SHALL menampilkan menu navigasi: Dashboard, Transaksi Penjualan, Kelola Pegawai, Laporan, Pemesanan Bahan, Penerimaan Stok, Data Produk, Data Bahan Baku, dan Keluar
3. WHEN pengguna mengklik menu navigasi, THEN Sistem SHALL mengarahkan ke halaman yang sesuai
4. THE Sistem SHALL menandai menu aktif dengan background merah dan teks putih
5. THE Sistem SHALL menggunakan tema warna merah (#DC2626) dan putih sebagai warna utama
