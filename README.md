# 🍰 Dapur Kue Nusantara — Sistem Penjualan Online

Sistem penjualan kue tradisional berbasis web dengan fitur:

- Halaman pelanggan untuk memesan kue
- Dashboard admin realtime
- Notifikasi WhatsApp otomatis
- Penyimpanan data di localStorage (tidak hilang saat refresh)
- Responsif di HP dan laptop

---

## 📁 Struktur Folder

```
kue-tradisional/
├── index.html          ← Halaman pelanggan (toko)
├── admin.html          ← Dashboard admin
├── css/
│   ├── style.css       ← Style halaman pelanggan
│   └── admin.css       ← Style dashboard admin
├── js/
│   ├── data.js         ← Data & localStorage helpers
│   ├── customer.js     ← Logic halaman pelanggan
│   └── admin.js        ← Logic dashboard admin
└── README.md
```

---

## ⚙️ LANGKAH-LANGKAH SETUP

### 1. Buka di VS Code

- Ekstrak folder `kue-tradisional`
- Klik kanan folder → "Open with Code"

### 2. Install Live Server (WAJIB untuk realtime)

- Di VS Code, tekan `Ctrl+Shift+X`
- Cari "Live Server" oleh Ritwick Dey
- Klik Install
- Setelah install, klik "Go Live" di kanan bawah VS Code

### 3. Setting Nomor WhatsApp Admin

- Buka `admin.html` di browser (via Live Server)
- Klik menu "Pengaturan" di sidebar
- Masukkan nomor WA kamu: format `628xxxxxxxxx` (62 = kode Indonesia, tanpa 0 di depan)
  - Contoh: 081234567890 → ditulis 6281234567890
- Klik "Simpan Pengaturan"

### 4. Jalankan

- Halaman pelanggan: `http://127.0.0.1:5500/index.html`
- Dashboard admin: `http://127.0.0.1:5500/admin.html`

---

## 📱 CARA KERJA NOTIFIKASI WA

1. Pelanggan mengisi pesanan di `index.html`
2. Klik "Konfirmasi & Kirim via WhatsApp"
3. **Otomatis terbuka WhatsApp** dengan pesan pesanan lengkap yang dikirim ke nomor WA admin
4. Admin terima pesan → lihat detail di dashboard
5. Admin bisa balas ke pelanggan langsung dari dashboard

> ⚠️ Notifikasi WA menggunakan **wa.me link** (WhatsApp Web/App).
> Ini cara terbaik tanpa API berbayar — 100% gratis!

---

## 🚀 PUBLISH KE GITHUB PAGES (Gratis!)

### Langkah 1: Buat Repository GitHub

1. Buka [github.com](https://github.com) → Login
2. Klik tombol "+" → "New repository"
3. Nama repo: `dapur-kue-nusantara`
4. Centang "Public"
5. Klik "Create repository"

### Langkah 2: Upload ke GitHub

```bash
# Di terminal VS Code (Ctrl+`)
cd path/ke/folder/kue-tradisional

git init
git add .
git commit -m "🍰 Launch sistem penjualan kue"
git branch -M main
git remote add origin https://github.com/USERNAME/dapur-kue-nusantara.git
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub kamu.

### Langkah 3: Aktifkan GitHub Pages

1. Buka repository di GitHub
2. Klik tab "Settings"
3. Scroll ke bagian "Pages" di menu kiri
4. Source: pilih `Deploy from a branch`
5. Branch: pilih `main`, folder `/root`
6. Klik "Save"
7. Tunggu 2-3 menit, lalu akses:
   - Toko: `https://USERNAME.github.io/dapur-kue-nusantara/`
   - Admin: `https://USERNAME.github.io/dapur-kue-nusantara/admin.html`

---

## 🎯 FITUR LENGKAP

### Halaman Pelanggan (index.html)

- ✅ Tampilan toko yang cantik dan profesional
- ✅ Menu kue dengan foto emoji, deskripsi, harga
- ✅ Keranjang belanja floating (muncul otomatis)
- ✅ Form pemesanan lengkap (nama, WA, alamat, catatan)
- ✅ Pilihan metode pembayaran
- ✅ Kirim pesanan langsung via WhatsApp
- ✅ Update menu realtime dari admin

### Dashboard Admin (admin.html)

- ✅ Statistik real-time (total pesanan, pendapatan, dll)
- ✅ Daftar pesanan dengan filter & pencarian
- ✅ Detail pesanan lengkap
- ✅ Update status pesanan (Baru → Diproses → Selesai)
- ✅ Kirim konfirmasi ke pelanggan via WA
- ✅ Kelola menu (tambah, edit, hapus, set stok)
- ✅ Pengaturan toko
- ✅ Notifikasi browser saat pesanan baru masuk
- ✅ Indikator Live realtime

### Data & Storage

- ✅ Semua data tersimpan di localStorage browser
- ✅ Data tidak hilang meski halaman di-refresh
- ✅ Realtime sync antar tab (admin & toko di tab berbeda)

---

## 💡 TIPS

- Buka `admin.html` di satu tab dan `index.html` di tab lain untuk melihat realtime update
- Klik "Test WA" di dashboard untuk test koneksi WhatsApp
- Menu yang habis tetap tampil tapi tidak bisa dipesan
- Data tersimpan di browser lokal — untuk multi-device, pertimbangkan upgrade ke Firebase

---

## 📞 Support

Jika ada kendala, cek:

1. Pastikan buka via Live Server, bukan double-click file HTML
2. Pastikan nomor WA di pengaturan format benar (628xxx)
3. Pastikan browser mengizinkan popup untuk buka WA

---

_Dibuat dengan ❤️ untuk UMKM Indonesia_
