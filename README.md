# HJKARPET - Katalog PWA

Aplikasi katalog karpet HJKARPET yang dapat berjalan offline dengan fitur Progressive Web App (PWA).

## 🚀 Fitur

- **PWA (Progressive Web App)** - Dapat diinstall sebagai aplikasi native
- **Offline Support** - Berfungsi tanpa internet setelah data pertama kali di-download
- **Data Sync** - Sinkronisasi data terbaru dengan tombol "Sync Data"
- **Auto Update** - Notifikasi update otomatis saat ada versi baru
- **Responsive Design** - Tampilan optimal di desktop dan mobile

## 📱 Cara Install sebagai Aplikasi

### Chrome/Edge Desktop:
1. Buka website di browser Chrome atau Edge
2. Klik menu 3 titik (⋮) di pojok kanan atas
3. Pilih "Install HJKARPET - Katalog"
4. Klik "Install" pada dialog yang muncul

### Chrome Mobile:
1. Buka website di Chrome mobile
2. Klik menu 3 titik (⋮) di pojok kanan atas
3. Pilih "Add to Home screen"
4. Klik "Add" pada dialog yang muncul

### Safari Mobile:
1. Buka website di Safari mobile
2. Klik tombol share (kotak dengan panah)
3. Pilih "Add to Home Screen"
4. Klik "Add" pada dialog yang muncul

## 🔄 Cara Sinkronisasi Data

1. Pastikan terhubung ke internet
2. Klik tombol "🔄 Sync Data" di halaman utama
3. Tunggu hingga proses selesai
4. Data terbaru akan tersimpan untuk penggunaan offline

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build untuk Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run start
```

## 📁 Struktur Project

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout dengan PWA setup
│   ├── page.tsx           # Halaman utama
│   ├── products/          # Halaman produk
│   └── portofolio/        # Halaman portfolio
├── components/            # React components
│   ├── PWAStatus.tsx      # Komponen status PWA
│   └── ui/               # UI components
├── hooks/                # Custom hooks
│   ├── useOfflineData.ts # Hook untuk data offline
│   └── useClientData.ts  # Hook untuk data client
└── lib/                  # Utilities
    ├── api.ts           # API functions
    └── types.ts         # TypeScript types

public/
├── manifest.json        # PWA manifest
├── worker-custom.js     # Service worker
└── icons/              # PWA icons
```

## 🔧 Konfigurasi PWA

### Service Worker
- File: `public/worker-custom.js`
- Menangani caching untuk offline support
- Auto-update saat ada versi baru

### Manifest
- File: `public/manifest.json`
- Konfigurasi tampilan dan behavior PWA
- Icon dan metadata aplikasi

### Next.js Config
- File: `next.config.ts`
- Konfigurasi PWA dengan `@ducanh2912/next-pwa`
- Runtime caching untuk API dan assets

## 📊 Offline Data Management

Aplikasi menggunakan strategi caching berikut:

1. **Static Assets**: Cache-first untuk gambar, CSS, JS
2. **API Data**: Network-first dengan fallback ke cache
3. **Navigation**: Cache-first dengan fallback ke home page
4. **Local Storage**: Backup data untuk akses cepat

## 🧪 Testing

### Test Offline Mode:
1. Buka website dan sync data
2. Matikan internet
3. Refresh halaman
4. Pastikan aplikasi tetap berfungsi

### Test PWA Install:
1. Buka di Chrome desktop/mobile
2. Pastikan prompt install muncul
3. Install aplikasi
4. Test dari home screen

### Test Auto Update:
1. Deploy versi baru
2. Buka aplikasi yang sudah terinstall
3. Pastikan notifikasi update muncul
4. Test proses update

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Static Export
```bash
npm run build
# Files akan tersedia di out/ directory
```

## 📝 Notes

- PWA hanya berfungsi di HTTPS (kecuali localhost)
- Service worker di-disable di development mode
- Data offline disimpan di localStorage dan service worker cache
- Auto-update hanya berfungsi jika ada perubahan pada service worker

## 🤝 Contributing

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## 📄 License

MIT License
