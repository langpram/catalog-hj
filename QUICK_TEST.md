# 🚀 **QUICK TEST - Debug 404 Issue**

## 🔧 **Step 1: Akses Port yang Benar**

**Dev server jalan di port 3001, bukan 3000!**

```bash
# Buka browser dan akses:
http://localhost:3001
```

## 🎯 **Step 2: Test Basic Routing**

1. **Buka** `http://localhost:3001`
   - Harus tampil halaman utama dengan CSS ✅

2. **Buka** `http://localhost:3001/products`
   - Harus tampil halaman produk list ✅

3. **Buka** `http://localhost:3001/product/268`
   - **Expected**: Halaman produk detail atau fallback offline
   - **Jika 404**: Ada masalah dengan dynamic routing

## 🔍 **Step 3: Debug Info**

### **Cek Console (F12):**
- Error messages
- Service worker logs
- CSS loading errors

### **Cek Network Tab:**
- Failed requests
- 404 responses
- CSS/JS loading

## 🛠️ **Step 4: Quick Fixes**

### **Jika CSS Tidak Ter-render:**

1. **Clear browser cache:**
   - F12 → Application → Storage → Clear site data
   - Refresh halaman

2. **Disable service worker sementara:**
   - F12 → Application → Service Workers
   - Unregister service worker
   - Refresh halaman

### **Jika Masih 404:**

1. **Test dengan ID lain:**
   - `http://localhost:3001/product/1`
   - `http://localhost:3001/product/123`

2. **Cek file structure:**
   ```
   src/app/product/[id]/page.tsx ✅
   ```

## 📱 **Step 5: Test Offline**

1. **Sync data dulu:**
   - Klik "🔄 Sync Data" di halaman utama

2. **Test offline:**
   - F12 → Network → Centang "Offline"
   - Refresh halaman produk

## 🎯 **Expected Results**

### **Online Mode:**
- ✅ Halaman produk tampil normal
- ✅ CSS ter-render dengan baik
- ✅ Data dari API

### **Offline Mode:**
- ✅ Fallback message: "Anda Sedang Offline"
- ✅ Tombol navigasi ke halaman produk
- ✅ Tidak 404

## 🆘 **Jika Masih Bermasalah**

1. **Share error di console**
2. **Share status debug panel**
3. **Share URL yang diakses**
4. **Coba di browser lain**

---

**💡 Tips:** Pastikan akses port 3001, bukan 3000!
