# MoneyPlan — Frontend Development Guide

## 1. Project Overview

Web app **MoneyPlan** (repo/domain: FlowFund) untuk zero-based budgeting pribadi: isi pemasukan bulanan → bagi ke 3 pilar (Tabungan, Kebutuhan, Keinginan) → pecah ke sub-alokasi → catat transaksi harian sampai sisa Rp 0.

Backend ada di repo terpisah `budgeting-api` (Go/Gin). Kebutuhan produk: `PRD_Financial_Budgeting_Monitoring.md`. Design system: **FlowFund Design System** di Claude Design (https://claude.ai/artifact/LXz4xUC7QiCqcbmv9ejsEh).

Production: `https://flowfund-app.vercel.app`.

---

## 2. Tech Stack

| Layer | Package |
|---|---|
| Framework | Nuxt 4 · Vue 3 (`<script setup lang="ts">`) |
| Styling | `@nuxtjs/tailwindcss` (Tailwind 3) + CSS variables di `assets/css/main.css` |
| Ikon | `@nuxt/icon` — Lucide (`lucide:*`), Phosphor Bold hanya di MonthPicker (`ph:*-bold`) |
| Chart | `vue3-apexcharts` (plugin client-only, dibungkus `<ClientOnly>`) |
| Font | Inter (body) + Outfit (h1–h6) dari Google Fonts |
| Hosting | Vercel |

Tidak ada Pinia, Vitest, atau test framework lain. Jangan menambah dependency baru tanpa plan yang disetujui.

---

## 3. Project Structure

```
pages/            # login, register, dashboard, transactions, budgeting
components/       # Navbar, SummaryStats, InputTransaction, ListTransaction, MonthPicker
layouts/default.vue
middleware/auth.global.ts   # redirect berdasarkan cookie auth_token
plugins/apexcharts.client.ts
types/budget.ts   # BudgetPlan, BudgetItem, BudgetCategory
assets/css/main.css         # token warna (HSL), font, utilitas .glass*
composables/ utils/         # masih kosong
```

---

## 4. Menjalankan & Deploy

```bash
npm install
npm run dev                                                          # apiBase default http://localhost:8080 (jalankan budgeting-api lokal)
NUXT_PUBLIC_API_BASE=https://budgeting-api-henna.vercel.app npm run dev   # pakai API production
npm run build                                                        # wajib lolos sebelum push
```

- Pakai **npm** (`package-lock.json`). Ada `bun.lock` sisa; jangan diperbarui.
- **Deploy = push ke `main`.** Di project Vercel `flowfund-app`, env `NUXT_PUBLIC_API_BASE` berisi URL API production, tanpa `/` di akhir.

---

## 5. Coding Conventions

### API calls

- **Selalu** pakai base URL dari runtime config, jangan tulis URL langsung:

  ```ts
  const apiBase = useRuntimeConfig().public.apiBase
  const { data } = await useFetch(`${apiBase}/transactions`, { params: { user_id: userId } })
  ```

- Panggil `useRuntimeConfig()` di top-level `<script setup>`, bukan di dalam event handler.
- Bentuk response dari API: data di `response.data`, error di `error.data?.error`.
- Field `Transaction` dari API **PascalCase** (`ID`, `Type`, `Amount`, `Note`, `Date`), field budget **snake_case**. Ikuti apa adanya.

### Komponen & halaman

- Composition API + `<script setup lang="ts">`. Tipe bersama ditaruh di `types/`.
- Logika yang dipakai di lebih dari satu file dipindah ke `composables/` atau `utils/`. Contoh yang sudah terduplikasi dan layak diekstrak saat file-nya disentuh: `formatCurrency` (ada di 4 file), pembacaan cookie `user_id`.
- Untuk feedback ke pengguna, utamakan UI di halaman (pesan inline, dialog, toast) daripada `alert()`/`confirm()`. Kode lama masih memakai `alert()` (13 tempat); ganti hanya di bagian yang sedang diubah.

### UI & copy

- Semua teks UI **bahasa Indonesia**. Tombol diawali kata kerja (Simpan, Tambah, Hapus, Batal); placeholder memberi contoh ("Contoh: Makan siang").
- Uang: `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })`. Bulan: `YYYY-MM`, label `toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })`.
- Tanggal "hari ini" harus memakai waktu lokal, bukan `toISOString()` (UTC membuat tanggal mundur sehari antara 00.00–07.00 WIB).
- Warna: ada **dua biru**. `primary` (steel blue, `bg-primary`) untuk brand — wordmark, nav aktif, tombol login. `#1A73E8` untuk tombol aksi dan focus di halaman Budgeting/Transaksi. Jangan menambah biru ketiga.
- Warna pilar tetap: Tabungan hijau `#34A853`, Kebutuhan kuning `#FBBC04`, Keinginan merah `#EA4335`. Progress bar: ≤70% `#00C853`, 70–90% `#FF8F00`, >90% `#D32F2F`.
- `rounded-lg` = 16px (di-override `--radius`), sedangkan `rounded-xl` = 12px — lebih kecil dari `lg`.
- Semua kontrol minimal tinggi 44px (`min-h-11`). Teks kecil jangan pakai `text-slate-400`, `text-[#34A853]`, atau `text-[#FF8F00]` (kontras di bawah 4.5:1).
- Detail token dan komponen: lihat FlowFund Design System.

### Komentar

**Default: jangan tulis komentar.** Kode harus menjelaskan dirinya sendiri lewat nama variabel, nama fungsi, dan struktur yang jelas — bukan lewat paragraf komentar di atasnya. Komentar yang hanya mengulang apa yang sudah terbaca dari kode membuat file penuh dan cepat basi saat kode berubah.

| Jangan | Sebabnya |
|---|---|
| Komentar yang menarasikan apa yang dilakukan baris di bawahnya (`// hitung total` di atas `items.reduce(...)`) | Mengulang kode |
| Komentar pembuka di tiap fungsi/komponen yang hanya menyebut ulang namanya | Tidak menambah informasi |
| Komentar penanda seksi di template atau script (`<!-- Header -->`, `// ── Helpers ──`) | Kalau file butuh penanda seksi, file-nya yang terlalu besar — pecah jadi komponen |

**Satu-satunya pengecualian**: alasan (*why*) yang tidak bisa disimpulkan dari kode dan akan membuat orang berikutnya salah mengubahnya — keputusan yang disengaja, workaround, atau aturan bisnis yang tampak janggal. Tulis sebagai satu kalimat pendek, jelaskan alasannya, bukan mekanismenya.

```ts
// BENAR — alasan yang tak terbaca dari kode
// Realisasi dihitung dari nama sub-alokasi di Note karena transaksi belum punya relasi ke BudgetItem.
const actualSpent = transactions.filter(t => t.Note?.includes(item.name))

// SALAH — menarasikan ulang kode
// Ambil daftar transaksi
const transactions = response.data || []
```

Aturan ini berlaku untuk kode baru maupun saat memodifikasi kode existing. Komentar existing yang sudah ada **jangan dihapus massal** tanpa diminta — hapus hanya yang berada di blok yang memang sedang diubah.

---

## 6. Auth — Kondisi Saat Ini

- Login menyimpan cookie `auth_token` (isinya hanya `"logged-in"`, belum token sungguhan), `user_id`, `user_name`, `user_email`, berlaku 3 hari.
- `middleware/auth.global.ts` hanya mengecek ada/tidaknya `auth_token`: `/` → `/dashboard` atau `/login`; halaman selain `/login` & `/register` butuh cookie.
- `user_id` dari cookie dikirim ke API sebagai query/body.

> [!WARNING]
> **Backend belum memverifikasi siapa yang memanggil.** Mengganti cookie `user_id` sudah cukup untuk membaca data user lain. Saat auth diperbaiki (JWT), frontend perlu mengirim header `Authorization` dan berhenti mengirim `user_id`.

---

## 7. Data Flow Penting

| Hal | Detail |
|---|---|
| Transaksi → sub-alokasi | Tidak ada relasi ID. `InputTransaction` menyimpan `Note` = `"<sub-alokasi> - <deskripsi> - <bank> - <catatan>"`; `ListTransaction` mem-parse dengan `split(' - ')`. Realisasi sub-alokasi dihitung dengan `Note.includes(nama)`, jadi nama yang mirip (Makan / Makanan) ikut terhitung. |
| Nominal & bank 3 pilar | Dikirim sebagai `allocatedAmount`/`bankName`, tapi **tidak disimpan backend** — kosong lagi setelah reload. |
| Tambah sub-alokasi | `saveItem` memanggil `fetchBudget()` setelah berhasil, yang **menimpa isian pemasukan/pilar yang belum disimpan**. |
| Dashboard kosong | Saat belum ada budget, Sisa = 0 sehingga kartu menampilkan "ZBB tercapai" — menyesatkan untuk pengguna baru. |

---

## 8. Verifikasi

- Tidak ada unit test. Minimal: `npm run build` lolos.
- Untuk perubahan alur, uji di browser (Playwright atau manual) dengan akun tes, bukan akun asli. Akun tes yang sudah ada: `qa.flowfund.567106@example.com`.
- Cek tampilan di lebar 390px: tidak boleh ada scroll horizontal.

---

## 9. Planning Mode Guidelines

When asked to create an implementation plan (Planning Mode), you MUST strictly adhere to the following rule:
**DO NOT write any code, execute modifying commands, or alter system state until the user has explicitly approved the implementation plan or given explicit instructions to start coding.**

Your sole responsibility during this phase is to research (read files, grep, etc.) and write the plan artifact.

### Klarifikasi Sebelum Menulis Plan

Sebelum menulis dokumen plan, jika ada hal yang belum jelas dan **jawabannya mengubah isi plan** — scope, pendekatan teknis, aturan bisnis, penamaan, atau trade-off — tanyakan lebih dulu:

- **Maksimal 4 pertanyaan**, diajukan sekaligus dalam satu kali tanya, bukan bertahap satu per satu.
- Hanya untuk hal yang benar-benar tidak bisa disimpulkan dari kode, konvensi repo, atau permintaan user. Jangan tanyakan hal yang sudah punya default jelas — ambil default-nya dan sebutkan di plan.
- Setiap pertanyaan sertakan opsi konkret beserta konsekuensinya, dan tandai mana yang direkomendasikan.
- Jika semuanya sudah jelas, langsung tulis plan tanpa bertanya.
- Pertanyaan yang muncul **setelah** plan ditulis dan tidak memblokir penulisan masuk ke komponen **Open Questions** (§10 komponen 13), bukan ditanyakan di muka.

## 10. Implementation Plan Structure

Every implementation plan MUST include the following components **in this order**. Skip a component only if it is genuinely not applicable to the task.

### Header Dokumen

Setiap dokumen plan dibuka dengan judul `# <Nama Fitur>` lalu **tabel metadata** — sebelum kotak "Ringkasan Singkat" dan sebelum komponen 1. Tabel ini yang menjawab: dokumen ini versi berapa, sudah disetujui atau belum, kapan terakhir disentuh, dan siapa yang menulisnya.

```markdown
# Nama Fitur

| | |
|---|---|
| **Versi** | 1.0 |
| **Status** | Draft |
| **Tanggal Dibuat** | 2026-10-03 |
| **Terakhir Diperbarui** | 2026-10-03 |
| **Author** | fadilnuris |
| **Reviewer** | — |
```

**Aturan pengisian:**

| Field | Aturan |
|---|---|
| **Versi** | `MAJOR.MINOR`. Mulai dari `1.0`. Naikkan MINOR untuk revisi isi (klarifikasi, tambah detail, perbaikan). Naikkan MAJOR bila pendekatan/scope berubah sehingga plan lama tidak lagi valid. |
| **Status** | Salah satu dari: `Draft` → `In Review` → `Approved` → `Implemented` → `Superseded`. Plan baru selalu `Draft`. |
| **Tanggal Dibuat** | Tanggal dokumen pertama kali ditulis, format `YYYY-MM-DD`. Tidak pernah berubah. |
| **Terakhir Diperbarui** | Tanggal revisi terakhir, format `YYYY-MM-DD`. Wajib diperbarui setiap kali isi dokumen diubah. |
| **Author** | Nama penulis plan (default: git user pada repo). |
| **Reviewer** | Nama yang me-review/approve. Isi `—` bila belum ada. |

> [!IMPORTANT]
> **Header wajib diperbarui setiap kali plan direvisi, bukan hanya saat dibuat.** Revisi yang tidak menaikkan versi dan tidak mengubah tanggal membuat pembaca tidak bisa membedakan plan yang sudah dikoreksi dari plan yang basi.

**Riwayat Revisi** *(opsional, mulai dipakai saat versi ≥ 1.1)* — tabel di bawah header:

```markdown
| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.1 | 2026-10-04 | Tambah kolom bank per pilar |
| 1.0 | 2026-10-03 | Versi awal |
```

---

### Required Components

1. **Problem Statement** *(bahasa non-teknis — lihat catatan di bawah)* — Apa masalahnya, kenapa perlu diubah, dan dampaknya jika tidak diubah.
2. **Business Rules** *(bahasa non-teknis)* — Aturan bisnis yang harus dipenuhi oleh solusi — syarat & batasan dari sisi produk.
3. **Approach / Solution Overview** *(bahasa non-teknis)* — Pendekatan solusi yang dipilih, beserta perbandingan dengan alternatif lain (pros/cons table jika ada lebih dari 1 opsi).
4. **UI/UX Design** *(jika ada perubahan UI)* — Wajib menyertakan wireframe LoFi (low-fidelity, boleh berupa sketsa ASCII/box-layout sederhana, tidak perlu detail visual) untuk tiap state layar baru, plus mockup bila relevan, user flow, state & feedback (loading, success, error, empty state), dan responsive behavior.
5. **Perubahan UI Existing** *(jika ada perubahan UI)* — Wajib ada untuk setiap perubahan UI, berpasangan dengan komponen 4: before/after halaman atau komponen yang berubah, elemen baru yang ditambahkan beserta posisi dan interaksinya.
6. **Database / Data Design** — Struktur data baru dan modifikasi data existing — tabel, kolom, tipe data, relasi, index, constraint.
7. **Flow Diagram** *(bahasa non-teknis)* — Visualisasi alur proses menggunakan mermaid diagram:
   - **Write path** — kapan dan bagaimana data ditulis/diubah.
   - **Read path** — bagaimana data dibaca dan urutan prioritasnya.
8. **Event Summary Table** — Tabel ringkasan: per-event sistem, field apa yang berubah dan apa yang tidak.
9. **Scenario Walkthrough** — Contoh skenario konkret step-by-step — happy path, edge case, dan error case.
10. **Impacted Files / Components** — Daftar file atau komponen yang perlu dibuat (`[NEW]`) atau dimodifikasi (`[MODIFY]`) atau dihapus (`[DELETE]`), dikelompokkan per layer (database, model, handler, route, UI, dll).
11. **Data Migration / Backfill Strategy** — Bagaimana menangani data existing yang sudah ada sebelum fitur ini diimplementasi.
12. **Decisions Requiring Review** — Keputusan desain yang memerlukan persetujuan — naming, scope, UX, trade-off. Gunakan alert `[!IMPORTANT]` atau `[!WARNING]`.
13. **Open Questions** — Pertanyaan yang belum terjawab dan bisa mempengaruhi implementasi.
14. **Verification Plan** — Rencana pengujian:
    - **Automated tests** — daftar test case spesifik.
    - **Manual verification** — langkah validasi manual.

### Riwayat Prompt

Paling bawah dokumen, setelah komponen 14. Satu entri per prompt pemicu plan/revisi, verbatim (jangan diringkas/parafrase), urut terbaru→terlama:

```markdown
---

## Riwayat Prompt

### v1.1 — 2026-10-04
> Bank per pilar juga perlu disimpan ya

### v1.0 — 2026-10-03
> Buatkan plan supaya nominal 3 pilar tersimpan ke database
```

### Ordering Logic

**WHY** (1–2) → **WHAT** user lihat (3–5) → **HOW** secara teknis (6–9) → **IMPACT** (10–11) → **UNRESOLVED** (12–13) → **VERIFY** (14).

### Presentation Rules

Daftar komponen di atas menentukan *apa* isinya; aturan berikut menentukan *bagaimana* menyajikannya agar dokumen bisa dipindai cepat.

- **Kotak "Ringkasan Singkat" di paling atas** — tepat di bawah header dokumen dan sebelum komponen 1, berupa blockquote berisi 3–5 poin: apa yang dibuat, pemicu/kondisi utamanya, aksi yang dilakukan, dan yang sengaja tidak dilakukan. Pembaca harus menangkap inti fitur tanpa membaca seluruh dokumen. Tulis dengan bahasa non-teknis (lihat aturan di bawah).
- **Bahasa non-teknis untuk Ringkasan Singkat, Problem Statement, Business Rules, Approach/Solution Overview, dan Flow Diagram** — tulis dari sudut pandang dampak ke pengguna, pakai istilah sehari-hari, bukan istilah kode. Kalau istilah teknis memang perlu disebut supaya bisa dilacak ke implementasi (nama tabel, kolom, handler, endpoint, nama variabel di diagram), taruh dalam kurung setelah penjelasan non-teknisnya, jangan jadi kalimat utama.

  ```markdown
  Salah: `allocated_amount` ditambahkan ke `budget_categories` dan diisi di `SaveBudget`.
  Benar: Nominal tiap pilar sekarang ikut tersimpan, jadi tidak hilang saat halaman dibuka lagi (kolom baru `budget_categories.allocated_amount`, diisi oleh handler `SaveBudget`).
  ```

  Komponen lain (UI/UX Design, Database/Data Design, Event Summary Table, Impacted Files, dll) boleh sepenuhnya teknis karena pembacanya adalah engineer.
- **Tabel lebih baik daripada prosa** — daftar yang punya dimensi berulang (syarat, skenario, file terdampak, test case, temuan) ditulis sebagai tabel, bukan bullet panjang. Bullet hanya untuk daftar pendek satu dimensi.
- **Paragraf pendek** — maksimal 3–4 kalimat. Paragraf padat yang penuh nama kolom/struct dipecah menjadi tabel.
- **Pemisah antar-seksi** — gunakan `---` di antara komponen utama.
- **Alert diawali kalimat tebal** — tiap blok `[!IMPORTANT]` / `[!WARNING]` dibuka satu kalimat tebal yang merangkum isinya, supaya bisa dipindai tanpa membaca seluruh paragraf. Urutkan dari risiko terbesar.
- **Mermaid harus benar-benar render** — pakai label polos: tanpa tanda baca (`:` `=` `+` `.`), tanpa `<br/>`, tanpa `\n`, dan hindari label edge yang diawali `--`. Pecah kalimat panjang menjadi beberapa node, jangan dijejalkan ke satu label.
- **Rujukan antar-seksi wajib valid** — sebelum dokumen dianggap selesai, pastikan setiap rujukan `§n` menunjuk ke seksi yang benar dan tidak ada rujukan ke seksi yang tidak pernah dibuat.
- **Context memuat temuan, bukan hanya masalah** — bila hasil penelusuran kode mengubah bentuk solusi (mis. kolom yang ternyata tidak pernah dipakai kode manapun), sajikan sebagai tabel "Temuan → Implikasi", bukan dikubur di dalam paragraf.

### Lokasi & Penamaan File

Simpan dokumen plan di `docs/plans/<nama-fitur-kebab-case>.md` (contoh: `docs/plans/simpan-nominal-pilar.md`), kecuali user meminta lokasi lain. Plan yang menyentuh API dan frontend sekaligus disimpan di repo yang perubahannya paling besar, dan repo lainnya cukup merujuk ke sana.
