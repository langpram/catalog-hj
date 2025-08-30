# 🧪 **PANDUAN TESTING PWA & OFFLINE**

## 🚀 **Setup Awal**

### **1. Start Development Server**
```bash
npm run dev
```

### **2. Buka Browser**
1. Buka `http://localhost:3000`
2. Buka **DevTools** (F12)
3. Pilih tab **Console**

## 🔧 **Debug Panel**

Di pojok kanan bawah ada panel debug dengan status:
- **Network**: 🟢 Online / 🔴 Offline
- **Service Worker**: ✅ Active / ❌ Not registered
- **Cache**: ✅ Found / ❌ No catalog caches found
- **LocalStorage**: ✅ Data available / ❌ No offline data

## 📋 **Langkah Testing Step-by-Step**

### **Step 1: Register Service Worker**
1. Klik tombol **"Register SW"** di debug panel
2. Cek console untuk log: `"Custom Service Worker registered"`
3. Status harus berubah jadi: `✅ Active (Running)`

### **Step 2: Sync Data**
1. Klik tombol **"🔄 Sync Data"** di tengah halaman
2. Tunggu sampai muncul: `"Data berhasil disinkronkan!"`
3. Cek debug panel:
   - **LocalStorage**: `✅ Data available (timestamp)`
   - **Cache**: `✅ Found: catalog-app-v1, catalog-api-v1`

### **Step 3: Cache Halaman Produk**
1. **Kunjungi halaman produk** saat online:
   - Buka `/products` 
   - Klik salah satu produk (misal: `/product/268`)
2. **Force cache** halaman tersebut:
   - Klik tombol **"Force Cache Page"** di debug panel
   - Cek console untuk log: `"Product page cache requested"`
3. **Cek cache details** di debug panel untuk memastikan halaman tersimpan

### **Step 4: Test Offline**
1. **Aktifkan offline mode**:
   - F12 → Network tab → Centang "Offline"
   - Atau matikan WiFi/LAN
2. **Refresh halaman** produk yang sudah di-cache
3. **Expected result**: Halaman tetap bisa diakses, tidak 404

## 🔍 **Troubleshooting**

### **❌ Service Worker Tidak Ter-register**
```
Status: ❌ Not registered
```
**Solusi:**
1. Klik "Clear Cache" + "Clear LocalStorage"
2. Refresh halaman
3. Klik "Register SW" lagi
4. Cek console untuk error

### **❌ Cache Kosong**
```
Status: ❌ No catalog caches found
```
**Solusi:**
1. Pastikan sudah "Sync Data"
2. Klik "Refresh All" di debug panel
3. Cek console untuk error saat sync

### **❌ Halaman Produk Tetap 404**
```
This page could not be found.
```
**Solusi:**
1. **Pastikan halaman sudah di-cache**:
   - Kunjungi halaman saat online
   - Klik "Force Cache Page"
   - Cek cache details di debug panel
2. **Cek console** untuk log service worker
3. **Test dengan halaman lain** dulu (/, /products)

### **❌ CSS Tidak Loading Offline**
```
Halaman putih tanpa style
```
**Solusi:**
1. Pastikan service worker aktif
2. Sync data ulang
3. Clear cache dan register ulang

## 📊 **Expected Console Logs**

### **Service Worker Registration:**
```
Custom Service Worker: Loading...
Custom Service Worker: Installing...
Custom Service Worker: Cache opened
Custom Service Worker: Installed successfully
Custom Service Worker: Activating...
Custom Service Worker: Activated successfully
Custom Service Worker registered with scope: http://localhost:3000/
```

### **Data Sync:**
```
✅ Data synced successfully!
Custom Service Worker: Caching API data
Custom Service Worker: Banners cached
Custom Service Worker: Categories cached
Custom Service Worker: Products for category XXX cached
Custom Service Worker: Portfolios cached
```

### **Page Caching:**
```
Product page cache requested: http://localhost:3000/product/268
Custom Service Worker: Caching product page http://localhost:3000/product/268
Custom Service Worker: Product page cached successfully
```

### **Offline Navigation:**
```
Custom Service Worker: Handling navigation request http://localhost:3000/product/268
Custom Service Worker: Serving exact navigation from cache
```

## 🎯 **Testing Checklist**

- [ ] Service Worker ter-register ✅
- [ ] Data berhasil sync ✅
- [ ] Cache terisi (catalog-app-v1, catalog-api-v1) ✅
- [ ] Halaman produk di-cache ✅
- [ ] Offline mode aktif ✅
- [ ] Halaman produk bisa diakses offline ✅
- [ ] CSS tetap loading offline ✅

## 🆘 **Jika Masih Bermasalah**

1. **Share console logs** yang muncul
2. **Share status debug panel**
3. **Share error messages** yang muncul
4. **Coba di browser lain** (Chrome, Firefox, Edge)

## 🔄 **Reset Complete**

Jika semua gagal, reset total:
1. Klik "Clear Cache"
2. Klik "Clear LocalStorage"
3. Refresh halaman
4. Register SW ulang
5. Sync data ulang
6. Test step by step

---

**💡 Tips:** Selalu cek console dan debug panel untuk informasi detail tentang apa yang terjadi!
