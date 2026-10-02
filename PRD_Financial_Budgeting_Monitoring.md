# Product Requirements Document (PRD)
## Financial & Budgeting Monitoring — *MoneyPlan*

---

> **Versi:** 1.0.0
> **Tanggal:** 29 Juni 2026
> **Status:** Draft — Siap untuk Review Engineering & Design
> **Author:** Senior Product Manager
> **Stakeholders:** Engineering Lead, UI/UX Designer, QA Lead, Data Analyst

---

## Daftar Isi

1. [Product Overview & Objectives](#1-product-overview--objectives)
2. [User Personas & User Journey](#2-user-personas--user-journey)
3. [Functional Requirements & Feature Breakdown](#3-functional-requirements--feature-breakdown)
4. [Data Model & Schema (Database)](#4-data-model--schema-database)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [UI/UX Design Guidelines & Edge Cases](#6-uiux-design-guidelines--edge-cases)
7. [Appendix & Glosarium](#7-appendix--glosarium)

---

## 1. Product Overview & Objectives

### 1.1 Latar Belakang

Mayoritas masyarakat Indonesia usia produktif (22–35 tahun) tidak memiliki sistem pencatatan keuangan yang konsisten. Penelitian internal menunjukkan bahwa 68% pengguna smartphone di segmen ini menggunakan catatan manual (notes app, buku tulis, atau spreadsheet) untuk mencatat keuangan pribadi — pendekatan yang rentan terhadap inkonsistensi data dan tidak memberikan insight yang actionable.

**MoneyPlan** hadir sebagai solusi perencanaan keuangan berbasis **Zero-Based Budgeting (ZBB)** — sebuah filosofi di mana setiap rupiah dari pemasukan dialokasikan ke pos tertentu sehingga `Total Pemasukan - Total Alokasi = Rp0`. Pendekatan ini terbukti meningkatkan kesadaran keuangan dan membantu pengguna mencapai tujuan finansial jangka panjang.

### 1.2 Tujuan Produk (Product Goals)

| # | Tujuan | Indikator Keberhasilan |
|---|--------|------------------------|
| G1 | Membantu pengguna merencanakan alokasi anggaran bulanan secara terstruktur | ≥80% pengguna aktif menyelesaikan pengaturan budget di bulan pertama |
| G2 | Memberikan visibilitas real-time antara rencana vs. realisasi pengeluaran | ≥70% pengguna mencatat minimal 1 transaksi per hari selama 30 hari pertama |
| G3 | Mendorong disiplin menabung melalui alokasi eksplisit kategori Tabungan | Rata-rata alokasi Tabungan ≥20% dari total pemasukan pengguna aktif |
| G4 | Mengurangi kebiasaan overspending di kategori Keinginan | Pengeluaran riil kategori Keinginan ≤ alokasi budget pada ≥60% pengguna |

### 1.3 Target Pengguna

Aplikasi ini dirancang untuk pengguna **individual** (bukan bisnis) dengan profil:

- Usia 22–38 tahun, memiliki penghasilan tetap bulanan (karyawan, freelancer, atau wirausaha)
- Melek digital, terbiasa menggunakan aplikasi mobile untuk kegiatan sehari-hari
- Memiliki rekening di lebih dari satu bank digital (Blu, Linebank, Seabank, Jago, dll.)
- Memiliki motivasi untuk mengelola keuangan lebih baik namun tidak memiliki sistem yang solid

### 1.4 Success Metrics (OKR Framework)

#### Objective 1: Akuisisi & Aktivasi
- **KR1.1:** MAU (Monthly Active Users) mencapai 10.000 pada bulan ke-3 setelah launch
- **KR1.2:** Onboarding Completion Rate ≥75% (pengguna yang berhasil setup income + minimal 3 alokasi)
- **KR1.3:** Day-7 Retention ≥40%

#### Objective 2: Engagement & Habit Formation
- **KR2.1:** Rata-rata frekuensi input transaksi ≥5x/minggu per pengguna aktif
- **KR2.2:** ≥60% pengguna mengakses dashboard Analytics minimal 3x/minggu
- **KR2.3:** Feature adoption rate untuk Expense Tracking ≥65% dalam 14 hari pertama

#### Objective 3: Outcome Keuangan Pengguna
- **KR3.1:** ≥50% pengguna yang aktif 3 bulan berturut-turut tidak melebihi budget di kategori Kebutuhan
- **KR3.2:** Net Promoter Score (NPS) ≥45 pada bulan ke-6

---

## 2. User Personas & User Journey

### 2.1 User Personas

---

#### Persona A — "Raka si Fresh Graduate"

| Atribut | Detail |
|---------|--------|
| **Nama** | Raka Pratama |
| **Usia** | 24 tahun |
| **Pekerjaan** | Junior Software Engineer, gaji Rp6.500.000/bulan |
| **Bank** | Blu (utama), Seabank (jajan) |
| **Pain Points** | Sering tidak tahu kemana perginya gaji di pertengahan bulan. Tidak ada alokasi tabungan yang konsisten. Sering impulsive buying. |
| **Motivasi** | Ingin menabung untuk biaya nikah 3 tahun lagi. Ingin punya dana darurat. |
| **Tech Savviness** | Tinggi. Terbiasa dengan aplikasi mobile. |

**Kebutuhan Utama:**
- Input pemasukan sekali di awal bulan, lalu alokasikan ke pos-pos secara cepat
- Notifikasi saat mendekati batas budget kategori tertentu
- Visualisasi yang jelas antara rencana vs. realisasi

---

#### Persona B — "Siti si Ibu Rumah Tangga Bekerja"

| Atribut | Detail |
|---------|--------|
| **Nama** | Siti Rahayu |
| **Usia** | 32 tahun |
| **Pekerjaan** | Guru SD, penghasilan Rp4.200.000 + suami Rp5.500.000 |
| **Bank** | BCA (utama), Linebank (belanja) |
| **Pain Points** | Sulit memisahkan pengeluaran kebutuhan rumah tangga vs. kebutuhan pribadi. Dana darurat sering terpakai untuk kebutuhan tidak mendesak. |
| **Motivasi** | Ingin disiplin menabung untuk pendidikan anak. |
| **Tech Savviness** | Sedang. Nyaman dengan UI yang simpel dan intuitif. |

**Kebutuhan Utama:**
- UI yang tidak overwhelming, mudah dipahami tanpa tutorial panjang
- Bisa input pengeluaran kapan saja (saat belanja, saat di kasir)
- Laporan ringkas yang bisa disampaikan ke suami

---

### 2.2 User Journey Map

#### Journey: Setup Budget Bulanan (Happy Path)

```
[TRIGGER] Tanggal 1 bulan baru / Gajian masuk
      │
      ▼
[Step 1] BUKA APLIKASI
  → Layar: Dashboard Bulan Aktif
  → Sistem menampilkan bulan aktif (e.g., "June 2026")
  → Jika bulan baru, sistem prompt: "Atur Budget Bulan Ini?"
      │
      ▼
[Step 2] INPUT PEMASUKAN
  → Layar: Form Input Pemasukan
  → User input: Nominal Pemasukan (e.g., Rp6.500.000)
  → Field opsional: Sumber Pemasukan (Gaji, Freelance, Lainnya)
  → Simpan → sistem update "Total Pemasukan" di header dashboard
      │
      ▼
[Step 3] ATUR ALOKASI KATEGORI UTAMA
  → Layar: Allocation Setup
  → User mengisi nominal atau persentase untuk 3 kategori:
      • Tabungan → Rp1.300.000 (20%) → Bank: Blu
      • Kebutuhan → Rp3.900.000 (60%) → Bank: Linebank
      • Keinginan → Rp1.300.000 (20%) → Bank: Seabank
  → Sistem kalkulasi otomatis, tampilkan Pie Chart dinamis
  → Validasi: Total alokasi harus = Total Pemasukan (ZBB)
      │
      ▼
[Step 4] BUAT SUB-ALOKASI PENGELUARAN
  → Layar: Sub-Allocation Detail
  → User menambahkan pos-pos pengeluaran spesifik, contoh:
      • "Tabungan Utama" — Rp800.000 — Tabungan
      • "Tabungan Nikah"  — Rp500.000 — Tabungan
      • "Kos"             — Rp1.200.000 — Kebutuhan
      • "Transport"       — Rp600.000 — Kebutuhan
      • "Makan"           — Rp1.500.000 — Kebutuhan
      • "Ortu"            — Rp600.000 — Kebutuhan
      • "Gaya Hidup"      — Rp800.000 — Keinginan
      • "Sabun & Elektronik" — Rp500.000 — Keinginan
  → Sisa Uang (Unallocated) di-update real-time
  → Target: Sisa = Rp0 (budget terisi penuh)
      │
      ▼
[Step 5] KONFIRMASI & SIMPAN
  → Summary screen menampilkan: Pie Chart final + daftar sub-alokasi
  → User tap "Simpan Budget Bulan Ini"
  → Sistem lock budget (bisa diedit via tombol khusus)
      │
      ▼
[Step 6] HARIAN: CATAT PENGELUARAN
  → User tap tombol "+" dari dashboard
  → Input transaksi: Tanggal, Deskripsi, Nominal, Sub-Alokasi, Bank
  → Sistem potong saldo sub-alokasi terkait secara real-time
  → Progress bar sub-alokasi terupdate
      │
      ▼
[Step 7] REVIEW AKHIR BULAN
  → Dashboard Analytics menampilkan:
      • Budget vs. Actual per kategori dan sub-alokasi
      • Rekomendasi untuk bulan berikutnya
```

---

## 3. Functional Requirements & Feature Breakdown

### 3.1 Module 1: Income & Budget Allocation Setup

#### FR-1.1: Manajemen Pemasukan Bulanan

| ID | Requirement | Priority |
|----|------------|---------|
| FR-1.1.1 | Pengguna dapat menginput total pemasukan bulanan dalam satuan Rupiah (IDR) | P0 |
| FR-1.1.2 | Pengguna dapat menambahkan multiple sumber pemasukan (Gaji, Freelance, Bonus, dll.) yang dijumlahkan otomatis | P1 |
| FR-1.1.3 | Sistem menampilkan bulan aktif secara otomatis berdasarkan tanggal sistem | P0 |
| FR-1.1.4 | Pengguna dapat berpindah antar bulan (navigasi mundur/maju) untuk melihat riwayat | P1 |
| FR-1.1.5 | Sistem menyimpan data pemasukan per bulan secara terpisah (tidak overlap antar bulan) | P0 |

**Kalkulasi Otomatis:**
```
Total Pemasukan = SUM(semua sumber pemasukan aktif bulan berjalan)
Uang Dialokasikan = SUM(semua nominal sub-alokasi aktif)
Sisa Uang (Unallocated) = Total Pemasukan - Uang Dialokasikan
```

---

#### FR-1.2: Manajemen Kategori Finansial Utama (3 Pilar)

| ID | Requirement | Priority |
|----|------------|---------|
| FR-1.2.1 | Sistem menyediakan 3 kategori tetap: Tabungan, Kebutuhan, Keinginan | P0 |
| FR-1.2.2 | Setiap kategori memiliki field: Nominal Budget dan Nama Bank/Rekening | P0 |
| FR-1.2.3 | Sistem kalkulasi otomatis persentase tiap kategori terhadap Total Pemasukan | P0 |
| FR-1.2.4 | Pengguna dapat input nominal kategori sebagai angka absolut ATAU sebagai persentase (sistem konversi otomatis) | P1 |
| FR-1.2.5 | Validasi: Total ketiga kategori tidak boleh melebihi Total Pemasukan | P0 |
| FR-1.2.6 | Sistem menampilkan Pie Chart dinamis yang terupdate saat user mengubah nilai kategori | P0 |
| FR-1.2.7 | Pengguna dapat meng-assign nama bank/rekening ke setiap kategori (free text atau pilihan dari daftar populer) | P1 |

**Contoh Kalkulasi:**
```
Total Pemasukan: Rp6.500.000
Tabungan: Rp1.300.000 → 20,0%
Kebutuhan: Rp3.900.000 → 60,0%
Keinginan: Rp1.300.000 → 20,0%
──────────────────────────────
Total Dialokasikan: Rp6.500.000 ✓ (ZBB tercapai)
Sisa: Rp0
```

---

#### FR-1.3: Sub-Alokasi Pengeluaran (Dynamic Budget Breakdown)

| ID | Requirement | Priority |
|----|------------|---------|
| FR-1.3.1 | Pengguna dapat membuat sub-alokasi baru secara dinamis (tidak ada batas maksimum yang fix, recommended cap: 20 item) | P0 |
| FR-1.3.2 | Setiap sub-alokasi memiliki field wajib: Nama, Nominal Budget | P0 |
| FR-1.3.3 | Setiap sub-alokasi wajib dihubungkan ke salah satu Kategori Utama via dropdown (Tabungan / Kebutuhan / Keinginan) | P0 |
| FR-1.3.4 | Sistem kalkulasi otomatis persentase sub-alokasi terhadap Total Pemasukan | P0 |
| FR-1.3.5 | Pengguna dapat mengedit nama, nominal, dan kategori sub-alokasi kapan saja | P0 |
| FR-1.3.6 | Pengguna dapat menghapus sub-alokasi (dengan konfirmasi jika sudah ada transaksi terkait) | P0 |
| FR-1.3.7 | Pengguna dapat mengurutkan (drag-and-drop) urutan tampilan sub-alokasi | P2 |
| FR-1.3.8 | Sistem validasi: total sub-alokasi dalam satu kategori utama tidak boleh melebihi budget kategori tersebut | P1 |
| FR-1.3.9 | Sistem menampilkan ringkasan per kategori: "Dialokasikan X dari Y" dengan indikator warna (hijau/kuning/merah) | P1 |

**Tabel Struktur Data Sub-Alokasi (Tampilan UI):**

| Nama Sub-Alokasi | Nominal Budget | Kategori | % dari Income |
|------------------|---------------|----------|---------------|
| Tabungan Utama | Rp800.000 | Tabungan | 12,3% |
| Tabungan Nikah | Rp500.000 | Tabungan | 7,7% |
| Kos | Rp1.200.000 | Kebutuhan | 18,5% |
| Transport | Rp600.000 | Kebutuhan | 9,2% |
| Makan | Rp1.500.000 | Kebutuhan | 23,1% |
| Ortu | Rp600.000 | Kebutuhan | 9,2% |
| Gaya Hidup | Rp800.000 | Keinginan | 12,3% |
| Sabun & Elektronik | Rp500.000 | Keinginan | 7,7% |
| **TOTAL** | **Rp6.500.000** | — | **100%** |

---

### 3.2 Module 2: Expense Tracking Ledger

#### FR-2.1: Input Transaksi Pengeluaran Harian

| ID | Requirement | Priority |
|----|------------|---------|
| FR-2.1.1 | Pengguna dapat input transaksi pengeluaran dengan form yang mencakup: Tanggal, Deskripsi, Nominal, Sub-Alokasi, Metode Pembayaran/Bank | P0 |
| FR-2.1.2 | Tanggal default = hari ini (dapat diubah oleh pengguna) | P0 |
| FR-2.1.3 | Dropdown Sub-Alokasi menampilkan daftar sub-alokasi aktif bulan berjalan beserta sisa budget-nya | P0 |
| FR-2.1.4 | Sistem langsung memotong saldo Sub-Alokasi terkait segera setelah transaksi disimpan | P0 |
| FR-2.1.5 | Pengguna dapat mengedit transaksi yang sudah disimpan (sistem recalculate otomatis) | P0 |
| FR-2.1.6 | Pengguna dapat menghapus transaksi (saldo sub-alokasi di-restore) | P0 |
| FR-2.1.7 | Fitur input cepat (Quick Add): shortcut dari home screen berupa FAB (Floating Action Button) tombol "+" | P0 |
| FR-2.1.8 | Sistem menampilkan peringatan (warning) jika nominal transaksi akan membuat saldo sub-alokasi menjadi negatif (over budget) | P0 |
| FR-2.1.9 | Sistem tetap mengizinkan transaksi over-budget setelah peringatan ditampilkan dan pengguna konfirmasi | P1 |
| FR-2.1.10 | Pengguna dapat menambahkan catatan/memo opsional pada setiap transaksi | P2 |

**Spesifikasi Form Input Transaksi:**

```
┌─────────────────────────────────────┐
│ Catat Pengeluaran                   │
├─────────────────────────────────────┤
│ Tanggal *       [29 Juni 2026  ▼]   │
│ Deskripsi *     [______________________] │
│ Nominal *       [Rp ________________] │
│ Dari Sub-Alokasi * [Pilih Pos ▼]    │
│   └ Sisa budget: Rp xxx.xxx         │
│ Metode/Bank *   [Pilih Bank ▼]      │
│ Catatan         [______________________] │
├─────────────────────────────────────┤
│ [Batal]              [Simpan Pengeluaran] │
└─────────────────────────────────────┘
```

---

#### FR-2.2: Ledger Transaksi & Riwayat

| ID | Requirement | Priority |
|----|------------|---------|
| FR-2.2.1 | Tampilan daftar semua transaksi bulan berjalan, diurutkan berdasarkan tanggal (terbaru di atas) | P0 |
| FR-2.2.2 | Setiap item transaksi menampilkan: Tanggal, Deskripsi, Nominal, Sub-Alokasi, Bank | P0 |
| FR-2.2.3 | Fitur filter transaksi berdasarkan: Kategori Utama, Sub-Alokasi, Rentang Tanggal, Bank | P1 |
| FR-2.2.4 | Fitur pencarian transaksi berdasarkan deskripsi (free text search) | P1 |
| FR-2.2.5 | Pengguna dapat melihat transaksi bulan-bulan sebelumnya | P1 |
| FR-2.2.6 | Sistem mengelompokkan transaksi per tanggal dengan total harian | P1 |

---

### 3.3 Module 3: Analytics & Dashboard Visualization

#### FR-3.1: Dashboard Ringkasan Bulanan (Home Screen)

| ID | Requirement | Priority |
|----|------------|---------|
| FR-3.1.1 | Dashboard menampilkan header: Bulan Aktif, Total Pemasukan, Uang Dialokasikan, Sisa/Unallocated | P0 |
| FR-3.1.2 | Pie Chart interaktif menampilkan distribusi 3 kategori utama secara real-time | P0 |
| FR-3.1.3 | Pie Chart dapat di-tap untuk melihat detail kategori (drill-down) | P1 |
| FR-3.1.4 | Dashboard menampilkan ringkasan cepat: total pengeluaran hari ini, persentase budget terpakai bulan ini | P1 |

#### FR-3.2: Progress Bar Sub-Alokasi (Budget Tracker)

| ID | Requirement | Priority |
|----|------------|---------|
| FR-3.2.1 | Setiap sub-alokasi menampilkan progress bar yang merepresentasikan: Budget vs. Actual Spending | P0 |
| FR-3.2.2 | Progress bar menggunakan skema warna: Hijau (≤70%), Kuning (71–90%), Merah (>90% atau over-budget) | P0 |
| FR-3.2.3 | Di bawah progress bar, tampilkan teks informatif: "Terpakai Rp X dari Rp Y — Sisa Rp Z" | P0 |
| FR-3.2.4 | Saat sub-alokasi melebihi budget, tampilkan indikator "OVER BUDGET" dengan nominal overspending | P0 |
| FR-3.2.5 | Urutan tampilan sub-alokasi: yang mendekati batas (>70%) muncul di atas sebagai peringatan dini | P2 |

**Ilustrasi Progress Bar:**
```
MAKAN                              [Kebutuhan]
Budget: Rp1.500.000
████████████░░░░░░░░░░  Rp600.000 / Rp1.500.000
Terpakai: Rp600.000  |  Sisa: Rp900.000 (40%)

GAYA HIDUP                         [Keinginan]
Budget: Rp800.000
████████████████████░  Rp760.000 / Rp800.000
Terpakai: Rp760.000  |  Sisa: Rp40.000 (95%) ⚠️

KOS                                [Kebutuhan]
Budget: Rp1.200.000
████████████████████  Rp1.200.000 / Rp1.200.000 ✓ LUNAS
```

#### FR-3.3: Analytics Lanjutan

| ID | Requirement | Priority |
|----|------------|---------|
| FR-3.3.1 | Grafik Bar horizontal: Budget vs. Actual per sub-alokasi untuk bulan berjalan | P1 |
| FR-3.3.2 | Tren pengeluaran: line chart perbandingan total pengeluaran 3–6 bulan terakhir | P2 |
| FR-3.3.3 | Ringkasan akhir bulan otomatis: kategori dengan sisa terbanyak dan paling overspent | P2 |
| FR-3.3.4 | Export data ke format CSV | P3 |

---

## 4. Data Model & Schema (Database)

### 4.1 Entity Relationship Overview

```
Users ─────── (1:N) ──────► MonthlyBudgets
                                   │
                   ┌───────────────┼───────────────┐
                   ▼               ▼               ▼
            Incomes        BudgetCategories   ExpenseAllocations
                                   │                  │
                                   └──────────────────┘
                                          │ (1:N)
                                          ▼
                                     Transactions
```

---

### 4.2 Tabel: `users`

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|-----------|------------|
| `id` | UUID | PK | Unique identifier pengguna |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email login |
| `display_name` | VARCHAR(100) | NOT NULL | Nama tampilan |
| `currency` | CHAR(3) | DEFAULT 'IDR' | Kode mata uang |
| `created_at` | TIMESTAMP | NOT NULL | Waktu registrasi |
| `updated_at` | TIMESTAMP | NOT NULL | Waktu update terakhir |

---

### 4.3 Tabel: `monthly_budgets`

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|-----------|------------|
| `id` | UUID | PK | Unique identifier budget bulanan |
| `user_id` | UUID | FK → users.id | Pemilik budget |
| `period_year` | SMALLINT | NOT NULL | Tahun (e.g., 2026) |
| `period_month` | SMALLINT | NOT NULL, CHECK(1–12) | Bulan (e.g., 6) |
| `total_income` | BIGINT | NOT NULL, DEFAULT 0 | Total pemasukan bulan ini (dalam sen/poin terkecil) |
| `is_finalized` | BOOLEAN | DEFAULT FALSE | Status apakah budget sudah dikunci |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Constraint:** UNIQUE(`user_id`, `period_year`, `period_month`)

---

### 4.4 Tabel: `incomes`

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|-----------|------------|
| `id` | UUID | PK | |
| `monthly_budget_id` | UUID | FK → monthly_budgets.id | Budget bulan terkait |
| `source_name` | VARCHAR(100) | NOT NULL | Nama sumber (e.g., "Gaji Pokok") |
| `amount` | BIGINT | NOT NULL, CHECK(>0) | Nominal dalam IDR |
| `created_at` | TIMESTAMP | NOT NULL | |

---

### 4.5 Tabel: `budget_categories`

Menyimpan konfigurasi 3 kategori utama (Tabungan, Kebutuhan, Keinginan) per bulan.

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|-----------|------------|
| `id` | UUID | PK | |
| `monthly_budget_id` | UUID | FK → monthly_budgets.id | Budget bulan terkait |
| `category_type` | ENUM | NOT NULL | 'savings', 'needs', 'wants' |
| `allocated_amount` | BIGINT | NOT NULL, DEFAULT 0 | Nominal alokasi kategori |
| `bank_name` | VARCHAR(100) | NULLABLE | Nama bank/rekening terkait |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Constraint:** UNIQUE(`monthly_budget_id`, `category_type`)

---

### 4.6 Tabel: `expense_allocations`

Menyimpan sub-alokasi pengeluaran spesifik yang dibuat oleh pengguna.

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|-----------|------------|
| `id` | UUID | PK | |
| `monthly_budget_id` | UUID | FK → monthly_budgets.id | Budget bulan terkait |
| `budget_category_id` | UUID | FK → budget_categories.id | Kategori utama induk |
| `name` | VARCHAR(100) | NOT NULL | Nama sub-alokasi (e.g., "Makan") |
| `budget_amount` | BIGINT | NOT NULL, CHECK(≥0) | Budget yang direncanakan |
| `actual_spent` | BIGINT | NOT NULL, DEFAULT 0 | Total pengeluaran riil (computed/cached) |
| `display_order` | SMALLINT | DEFAULT 0 | Urutan tampilan |
| `is_active` | BOOLEAN | DEFAULT TRUE | Soft delete flag |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

> **Catatan Arsitektur:** `actual_spent` adalah *cached computed field* yang diupdate setiap kali ada INSERT/UPDATE/DELETE pada tabel `transactions`. Ini meningkatkan performa query dashboard. Rekonsiliasi penuh dapat dilakukan via background job harian.

---

### 4.7 Tabel: `transactions`

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|-----------|------------|
| `id` | UUID | PK | |
| `monthly_budget_id` | UUID | FK → monthly_budgets.id | Budget bulan terkait |
| `expense_allocation_id` | UUID | FK → expense_allocations.id | Sub-alokasi yang dipotong |
| `transaction_date` | DATE | NOT NULL | Tanggal transaksi |
| `description` | VARCHAR(255) | NOT NULL | Deskripsi pengeluaran |
| `amount` | BIGINT | NOT NULL, CHECK(>0) | Nominal pengeluaran |
| `payment_method` | VARCHAR(100) | NULLABLE | Metode/Bank pembayaran |
| `notes` | TEXT | NULLABLE | Catatan opsional |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

---

### 4.8 View/Query Penting

**View: `vw_allocation_summary` — Digunakan untuk Progress Bar Dashboard**
```sql
SELECT
    ea.id                                     AS allocation_id,
    ea.name                                   AS allocation_name,
    bc.category_type,
    ea.budget_amount,
    COALESCE(ea.actual_spent, 0)              AS actual_spent,
    ea.budget_amount - COALESCE(ea.actual_spent, 0) AS remaining,
    CASE
        WHEN ea.budget_amount = 0 THEN 0
        ELSE ROUND(
            CAST(COALESCE(ea.actual_spent, 0) AS NUMERIC) / ea.budget_amount * 100, 2
        )
    END                                       AS usage_percentage,
    CASE
        WHEN ea.budget_amount = 0 THEN 'green'
        WHEN COALESCE(ea.actual_spent, 0) > ea.budget_amount THEN 'red'
        WHEN COALESCE(ea.actual_spent, 0) >= ea.budget_amount * 0.9 THEN 'yellow'
        ELSE 'green'
    END                                       AS status_color
FROM expense_allocations ea
JOIN budget_categories bc ON ea.budget_category_id = bc.id
WHERE ea.is_active = TRUE;
```

---

## 5. Non-Functional Requirements

### 5.1 Performa

| ID | Requirement | Target Metric |
|----|------------|--------------|
| NFR-P1 | Waktu load halaman Dashboard (Cold Start) | ≤2 detik pada jaringan 4G |
| NFR-P2 | Waktu load halaman Dashboard (Warm/Cached) | ≤500ms |
| NFR-P3 | Waktu respons setelah user menyimpan transaksi baru (UI terupdate) | ≤300ms (optimistic update) |
| NFR-P4 | Waktu render ulang Pie Chart setelah perubahan alokasi | ≤200ms (animasi smooth 60fps) |
| NFR-P5 | API Response Time (P95) untuk semua endpoint | ≤500ms |

**Strategi Optimasi:**
- Gunakan **Optimistic UI Update**: saat user simpan transaksi, UI langsung terupdate secara lokal tanpa menunggu respons server. Jika server gagal, rollback dengan notifikasi.
- **Caching** data budget bulanan di local storage / IndexedDB untuk mode offline-light.
- Pagination pada daftar transaksi: load 30 item per scroll (infinite scroll).

---

### 5.2 Keamanan Data Keuangan Pribadi

| ID | Requirement | Detail |
|----|------------|--------|
| NFR-S1 | Autentikasi | JWT dengan expiry 24 jam + Refresh Token 30 hari. Support login via Google OAuth & Email/Password. |
| NFR-S2 | Enkripsi Data In-Transit | HTTPS/TLS 1.3 wajib untuk semua komunikasi client-server |
| NFR-S3 | Enkripsi Data At-Rest | Data keuangan sensitif (nominal, nama bank) dienkripsi di level database menggunakan AES-256 |
| NFR-S4 | Isolasi Data User | Setiap query ke database wajib menyertakan `user_id` filter. Row-Level Security (RLS) diaktifkan di Supabase/PostgreSQL |
| NFR-S5 | Proteksi dari Injection | Semua input divalidasi dan di-sanitize. Gunakan Parameterized Queries / ORM yang aman |
| NFR-S6 | App Lock | Pengguna dapat mengaktifkan PIN atau Biometric lock pada aplikasi mobile |
| NFR-S7 | Session Management | Auto-logout setelah 30 menit inaktif (dapat dikonfigurasi pengguna) |
| NFR-S8 | Audit Log | Setiap aksi modifikasi/hapus data keuangan dicatat di audit log (tidak dapat dihapus pengguna) |

---

### 5.3 Responsivitas UI/UX (Mobile-First)

| ID | Requirement | Detail |
|----|------------|--------|
| NFR-UX1 | Breakpoint Utama | Mobile: 375px–430px (prioritas utama). Tablet: 768px–1024px. Desktop: ≥1200px |
| NFR-UX2 | Touch Target Size | Semua tombol dan elemen interaktif minimal 44×44pt (Apple HIG) / 48×48dp (Material Design) |
| NFR-UX3 | Input Angka | Keyboard numerik otomatis muncul saat field nominal difokus |
| NFR-UX4 | Input Cepat | Dari home screen ke selesai mencatat transaksi: maksimal 5 tap |
| NFR-UX5 | Aksesibilitas | Semua elemen interaktif memiliki label aksesibilitas. Contrast ratio ≥4.5:1 (WCAG AA) |
| NFR-UX6 | Offline Support | Pengguna dapat melihat data budget bulan berjalan dan input transaksi dalam mode offline. Sinkronisasi otomatis saat koneksi tersedia |
| NFR-UX7 | Loading State | Setiap aksi async menampilkan skeleton loading atau spinner yang informatif |

---

### 5.4 Keandalan & Skalabilitas

| ID | Requirement | Target |
|----|------------|--------|
| NFR-R1 | Uptime SLA | ≥99.5% per bulan |
| NFR-R2 | Data Backup | Backup database otomatis harian, retensi 90 hari |
| NFR-R3 | Error Handling | Semua API error mengembalikan pesan yang ramah pengguna (bukan stack trace) |
| NFR-R4 | Skalabilitas | Arsitektur mendukung horizontal scaling hingga 100.000 pengguna aktif tanpa restrukturisasi |

---

## 6. UI/UX Design Guidelines & Edge Cases

### 6.1 Design System

#### Palet Warna

| Token | Hex | Penggunaan |
|-------|-----|-----------|
| `color-primary` | `#1A73E8` | CTA utama, link, aksen navigasi |
| `color-savings` | `#34A853` | Representasi kategori Tabungan |
| `color-needs` | `#FBBC04` | Representasi kategori Kebutuhan |
| `color-wants` | `#EA4335` | Representasi kategori Keinginan |
| `color-success` | `#00C853` | Budget dalam batas aman (≤70%) |
| `color-warning` | `#FF8F00` | Budget mendekati batas (71–90%) |
| `color-danger` | `#D32F2F` | Budget over limit (>90% atau negatif) |
| `color-surface` | `#FFFFFF` | Background kartu |
| `color-background` | `#F8F9FA` | Background halaman |
| `color-text-primary` | `#202124` | Teks utama |
| `color-text-secondary` | `#5F6368` | Teks sekunder/label |

#### Tipografi

| Level | Font | Size | Weight | Penggunaan |
|-------|------|------|--------|-----------|
| H1 | Inter | 24px | 700 | Judul halaman |
| H2 | Inter | 20px | 600 | Judul bagian |
| H3 | Inter | 16px | 600 | Sub-judul kartu |
| Body | Inter | 14px | 400 | Teks konten |
| Caption | Inter | 12px | 400 | Label kecil, metadata |
| Amount | Inter | 18px | 700 | Tampilan nominal uang |

#### Komponen Visual Utama

**Kartu Dashboard (Monthly Summary Card):**
```
┌──────────────────────────────────────────┐
│  June 2026                          ← →  │
├──────────────────────────────────────────┤
│  Total Pemasukan        Rp 6.500.000     │
│  Uang Dialokasikan      Rp 6.500.000     │
│  Sisa Uang              Rp 0     ✅ ZBB  │
└──────────────────────────────────────────┘
```

**Kartu Kategori Utama:**
```
┌────────────────────────┐
│ 🟢 TABUNGAN             │
│ Bank: Blu               │
│ Rp 1.300.000   20,0%   │
│ [████░░░░░░░░░░░░░░░]  │
└────────────────────────┘
```

---

### 6.2 Panduan Interaksi Dropdown

**Dropdown Sub-Alokasi pada Form Transaksi:**
- Setiap item dropdown menampilkan: Nama Sub-Alokasi + Badge Kategori + Sisa Budget
- Format: `[Icon Kategori] Nama Sub-Alokasi — Sisa: Rp xxx.xxx`
- Sub-alokasi yang over-budget ditampilkan dengan teks merah dan ikon peringatan ⚠️
- Urutan dropdown: dikelompokkan per kategori (Tabungan → Kebutuhan → Keinginan)

**Dropdown Kategori Utama pada Form Sub-Alokasi:**
- 3 pilihan saja: Tabungan, Kebutuhan, Keinginan
- Setiap pilihan menggunakan warna representasi kategori sebagai chip/badge

---

### 6.3 Edge Cases & Penanganannya

#### EC-1: Alokasi Melebihi Total Pemasukan

**Skenario:** User memasukkan sub-alokasi hingga total melebihi total pemasukan.

**Penanganan:**
- Real-time validasi: field "Sisa Uang" berubah warna menjadi merah jika negatif
- Muncul pesan inline di bawah total: `⚠️ Alokasi melebihi pemasukan sebesar Rp [X]. Kurangi alokasi atau tambah sumber pemasukan.`
- Tombol "Simpan Budget" di-disabled selama kondisi ini berlaku
- Tidak ada modal popup — validasi cukup ditampilkan inline untuk meminimalkan gangguan

---

#### EC-2: Pengeluaran Riil Melebihi Budget Sub-Alokasi (Over-Budget Transaction)

**Skenario:** User input transaksi Rp500.000 ke sub-alokasi "Makan" yang hanya tersisa Rp300.000.

**Penanganan:**
- Tampilkan modal konfirmasi: `"Budget Makan hampir habis! Kamu akan melampaui batas sebesar Rp200.000. Tetap lanjutkan?"`
- Dua opsi: **[Tetap Catat]** dan **[Batal, Pilih Pos Lain]**
- Jika pengguna memilih Tetap Catat: transaksi disimpan, saldo sub-alokasi menjadi negatif (-Rp200.000), progress bar berubah merah dengan label "OVER BUDGET Rp200.000"
- Data over-budget tetap tersimpan untuk keperluan analitik (jangan hilangkan riwayat)

---

#### EC-3: Total 3 Kategori Utama Tidak Sama Dengan Total Pemasukan

**Skenario:** User mengisi Tabungan Rp1.000.000, Kebutuhan Rp3.000.000, Keinginan Rp1.000.000 = Rp5.000.000 dari pemasukan Rp6.500.000.

**Penanganan:**
- Sisa Unallocated Rp1.500.000 ditampilkan dengan warna kuning/oranye
- Pesan: `"Masih ada Rp1.500.000 yang belum dialokasikan. Tambahkan ke salah satu kategori untuk mencapai Zero-Based Budget."`
- Pengguna **tidak** dipaksa ZBB — sistem menginformasikan tanpa memblokir penyimpanan (ZBB adalah rekomendasi, bukan hard constraint)

---

#### EC-4: User Menghapus Sub-Alokasi yang Sudah Memiliki Transaksi

**Skenario:** User ingin menghapus sub-alokasi "Transport" yang sudah memiliki 5 transaksi.

**Penanganan:**
- Tampilkan modal konfirmasi: `"Sub-alokasi 'Transport' memiliki 5 transaksi (total Rp250.000). Menghapus sub-alokasi ini tidak akan menghapus transaksi yang sudah ada, namun transaksi tersebut tidak akan terhubung ke pos manapun. Lanjutkan?"`
- Pilihan: **[Hapus Sub-Alokasi]** dan **[Batal]**
- Transaksi orphan tetap tersimpan di database, ditampilkan di ledger dengan label "[Pos dihapus]"

---

#### EC-5: Tidak Ada Pemasukan yang Diinput

**Skenario:** User mencoba membuat sub-alokasi tanpa mengisi total pemasukan terlebih dahulu.

**Penanganan:**
- UI menampilkan CTA yang prominent: "Mulai dengan isi total pemasukan bulan ini"
- Tombol "Tambah Sub-Alokasi" disabled sampai pemasukan > 0 diinput
- Onboarding tooltip muncul yang mengarahkan ke form input pemasukan

---

#### EC-6: Bulan Baru Tanpa Template Budget

**Skenario:** Tiba bulan Juli, user belum setup budget untuk bulan baru.

**Penanganan:**
- Saat user buka aplikasi di bulan baru: tampilkan bottom sheet `"Budget Juli 2026 belum diatur. Salin dari bulan lalu?"`
- Pilihan: **[Ya, Salin Budget Juni]** — otomatis buat budget Juli dengan struktur yang sama (nominal bisa diedit). **[Buat dari Awal]**. **[Nanti]** — dismiss, bisa diakses lagi dari menu.
- Fitur "salin dari bulan lalu" tidak menyalin transaksi, hanya struktur alokasi

---

#### EC-7: Nilai Input Nominal = 0 atau Negatif

**Penanganan:**
- Field nominal tidak menerima nilai ≤0
- Validasi client-side: jika user input 0 atau negatif, muncul error inline `"Nominal harus lebih dari 0"`
- Keyboard numerik tidak menyediakan tombol minus

---

#### EC-8: Multiple Income Sources — Salah Satu Dihapus

**Skenario:** User punya 2 sumber: Gaji Rp5.000.000 dan Freelance Rp2.000.000. User hapus Freelance, total income turun dari Rp7.000.000 menjadi Rp5.000.000. Sementara total alokasi masih Rp7.000.000.

**Penanganan:**
- Setelah penghapusan, sistem recalculate → Sisa Uang menjadi -Rp2.000.000
- Tampilkan banner peringatan merah di atas halaman alokasi: `"Total alokasi melebihi pemasukan terkini sebesar Rp2.000.000. Sesuaikan alokasi Anda."`
- Pengguna wajib menyesuaikan sebelum dapat menyimpan budget baru

---

### 6.4 Micro-Interactions & Feedback

| Aksi User | Feedback Sistem |
|-----------|----------------|
| Simpan transaksi baru | Haptic feedback ringan + toast notification: "Transaksi disimpan ✓" |
| Progress bar mencapai 90% | Warna berubah kuning + animasi pulse sekali |
| Progress bar over 100% | Warna berubah merah + badge "OVER" muncul dengan animasi |
| Budget bulan tercapai ZBB | Konfeti animasi singkat + pesan "Zero-Based Budget tercapai! 🎉" |
| Input nominal | Format Rupiah otomatis (titik ribuan) saat user mengetik |
| Swipe item transaksi ke kiri | Reveal tombol "Edit" dan "Hapus" |

---

## 7. Appendix & Glosarium

### 7.1 Glosarium

| Istilah | Definisi |
|---------|----------|
| **Zero-Based Budgeting (ZBB)** | Metode perencanaan keuangan di mana setiap rupiah dari pemasukan harus dialokasikan ke pos tertentu, sehingga: Pemasukan − Total Alokasi = Rp0 |
| **Sub-Alokasi** | Pos pengeluaran spesifik yang dibuat pengguna di dalam salah satu dari 3 kategori utama (Tabungan/Kebutuhan/Keinginan) |
| **Budget Amount** | Nominal yang direncanakan untuk suatu sub-alokasi dalam satu bulan |
| **Actual Spent** | Total pengeluaran riil yang sudah dicatat via transaksi untuk sub-alokasi tertentu |
| **Remaining / Sisa Budget** | Budget Amount − Actual Spent |
| **Unallocated** | Sisa pemasukan yang belum dialokasikan ke kategori manapun |
| **Over-Budget** | Kondisi saat Actual Spent > Budget Amount untuk suatu sub-alokasi |
| **Ledger** | Daftar catatan transaksi pengeluaran harian |
| **Optimistic Update** | Teknik UI di mana tampilan diperbarui secara instan di sisi client sebelum konfirmasi dari server diterima |
| **FAB** | Floating Action Button — tombol aksi utama yang mengambang di atas konten, umumnya di pojok kanan bawah layar |

---

### 7.2 Asumsi & Dependensi

| # | Asumsi/Dependensi |
|---|-------------------|
| A1 | Mata uang yang didukung pada versi pertama hanya IDR (Rupiah Indonesia) |
| A2 | Aplikasi ini tidak terintegrasi dengan rekening bank manapun secara langsung (tidak ada open banking/bank scraping) — semua input manual |
| A3 | Satu akun pengguna = satu set budget (tidak ada multi-user per akun) |
| A4 | Backend: Node.js/Supabase atau Laravel/PostgreSQL (TBD Engineering) |
| A5 | Frontend Mobile: React Native atau Flutter (TBD Engineering) |
| A6 | Tidak ada fitur pembayaran atau transfer dana — aplikasi murni pencatatan dan perencanaan |

---

### 7.3 Out of Scope (Versi 1.0)

Fitur-fitur berikut secara eksplisit **tidak** termasuk dalam lingkup MVP ini:

- Integrasi API perbankan / open banking
- Fitur berbagi budget dengan pasangan/keluarga (multi-user budget)
- Notifikasi push / reminder otomatis
- Fitur investasi atau perencanaan finansial jangka panjang (goal-based savings)
- Laporan pajak atau fitur perpajakan
- Dukungan multi-mata-uang
- Import/sync dari aplikasi keuangan lain (Spendee, Money Manager, dll.)
- AI-powered spending recommendation

> *Fitur-fitur di atas dicatat sebagai backlog kandidat untuk versi 1.1 dan seterusnya.*

---

### 7.4 Revision History

| Versi | Tanggal | Perubahan | Author |
|-------|---------|-----------|--------|
| 1.0.0 | 29 Jun 2026 | Initial Draft — semua pilar PRD | Senior PM |

---

*Dokumen ini bersifat living document. Setiap perubahan signifikan wajib melalui proses review bersama Engineering Lead, Design Lead, dan Product Owner sebelum diimplementasikan.*

---

**© 2026 MoneyPlan — Product Team. Dokumen ini bersifat internal dan rahasia.**
