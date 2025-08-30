# PWA Testing Guide

## 🧪 Cara Testing PWA Lokal

### 1. Development Mode (HTTP)
```bash
npm run dev
```
- Buka http://localhost:3000
- PWA features akan terbatas karena menggunakan HTTP
- Service worker akan di-disable

### 2. Production Mode (HTTP)
```bash
npm run build
npm run start
```
- Buka http://localhost:3000
- Service worker akan aktif
- PWA install prompt mungkin tidak muncul karena HTTP

### 3. Production Mode dengan HTTPS (Recommended)
Untuk testing PWA yang lengkap, gunakan HTTPS:

#### Option A: ngrok (Easiest)
```bash
# Install ngrok
npm install -g ngrok

# Build dan start aplikasi
npm run build
npm run start

# Di terminal baru, tunnel ke HTTPS
ngrok http 3000
```

#### Option B: mkcert (Local HTTPS)
```bash
# Install mkcert
# Windows: choco install mkcert
# macOS: brew install mkcert

# Generate local certificates
mkcert -install
mkcert localhost

# Buat folder certs dan pindahkan certificates
mkdir certs
# Pindahkan localhost.pem dan localhost-key.pem ke folder certs/

# Install express untuk HTTPS server
npm install express

# Jalankan HTTPS server
node scripts/serve-https.js
```

## 📱 Testing Checklist

### ✅ Service Worker
- [ ] Service worker ter-register
- [ ] Cache berfungsi (lihat di DevTools > Application > Cache)
- [ ] Offline mode berfungsi

### ✅ PWA Install
- [ ] Manifest.json ter-load
- [ ] Install prompt muncul
- [ ] Aplikasi dapat diinstall
- [ ] Aplikasi berjalan dari home screen

### ✅ Offline Data
- [ ] Data tersimpan di localStorage
- [ ] Sync button berfungsi
- [ ] Data tersedia saat offline
- [ ] Update notification muncul

### ✅ Auto Update
- [ ] Service worker update terdeteksi
- [ ] Update notification muncul
- [ ] Aplikasi dapat di-update

## 🔍 Chrome DevTools

### Application Tab
1. **Manifest**: Cek manifest.json
2. **Service Workers**: Cek registration dan status
3. **Cache Storage**: Cek cached resources
4. **Local Storage**: Cek offline data

### Console
- Monitor service worker logs
- Cek PWA events
- Debug offline functionality

## 🐛 Troubleshooting

### Service Worker Tidak Register
- Pastikan menggunakan HTTPS atau localhost
- Cek console untuk error
- Clear browser cache

### Install Prompt Tidak Muncul
- Pastikan menggunakan HTTPS
- Cek manifest.json valid
- Pastikan criteria PWA terpenuhi

### Offline Mode Tidak Berfungsi
- Cek service worker aktif
- Cek cache storage
- Cek localStorage data

### Data Tidak Sync
- Cek koneksi internet
- Cek API endpoint
- Cek console untuk error

## 📊 PWA Audit

Gunakan Lighthouse untuk audit PWA:

1. Buka Chrome DevTools
2. Pilih tab Lighthouse
3. Pilih "Progressive Web App"
4. Klik "Generate report"

Target score: 90+ untuk semua kategori

## 🚀 Deployment Testing

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
# Deploy folder .next ke Netlify
```

### Custom Server
```bash
npm run build
npm run start
# Deploy ke server dengan HTTPS
```

## 📝 Notes

- PWA membutuhkan HTTPS (kecuali localhost)
- Service worker di-disable di development mode
- Test di berbagai browser (Chrome, Edge, Safari)
- Test di mobile dan desktop
- Test dengan koneksi lambat dan offline
