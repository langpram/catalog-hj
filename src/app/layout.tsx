// src/app/layout.tsx
"use client";

import { Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import { ProductPageCache } from "@/components/ProductPageCache";

// Nunito untuk headings
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Nunito Sans untuk body text (opsional, bisa pakai Nunito juga)
const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans", 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Register service worker - DISABLED FOR TESTING
  useEffect(() => {
    // Temporarily disable service worker for testing
    console.log('Service Worker registration disabled for testing');
    
    /*
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
          .then(function(registration) {
            console.log('Custom Service Worker registered with scope:', registration.scope);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content is available, show update notification
                    if (confirm('Update tersedia! Klik OK untuk memperbarui aplikasi.')) {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                      window.location.reload();
                    }
                  }
                });
              }
            });
          })
          .catch(function(error) {
            console.log('Custom Service Worker registration failed:', error);
          });
      });
    }
    */
  }, []);

  return (
    <html lang="id">
      <head>
        <title>HJKARPET - Katalog</title>
        <meta name="description" content="Supplier karpet berkualitas tinggi untuk masjid, kantor, hotel, dan kebutuhan interior lainnya." />
        <meta name="keywords" content="karpet, karpet masjid, karpet kantor, karpet hotel, interior, sajadah" />
        <meta name="author" content="HJKARPET" />
        
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HJKARPET - Katalog" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        
        {/* Open Graph */}
        <meta property="og:title" content="HJKARPET - Katalog" />
        <meta property="og:description" content="Supplier karpet berkualitas tinggi untuk masjid, kantor, hotel, dan kebutuhan interior lainnya." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="id_ID" />
        
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${nunito.variable} ${nunitoSans.variable} font-sans antialiased`}
      >
        <ProductPageCache />
        {children}
      </body>
    </html>
  );
}