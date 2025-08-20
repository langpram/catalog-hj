// src/app/layout.tsx
import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "HJKARPET - Katalog",
  description: "Supplier karpet berkualitas tinggi untuk masjid, kantor, hotel, dan kebutuhan interior lainnya.",
  keywords: "karpet, karpet masjid, karpet kantor, karpet hotel, interior, sajadah",
  authors: [{ name: "HJKARPET" }],
  openGraph: {
    title: "HJKARPET - Katalog",
    description: "Supplier karpet berkualitas tinggi untuk masjid, kantor, hotel, dan kebutuhan interior lainnya.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${nunito.variable} ${nunitoSans.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}