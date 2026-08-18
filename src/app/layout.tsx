import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "BIMXZBUGXZ — BimzOfficial Edition | V1 Red Neon",
  description: "✨ BimxBugz By BimzOfficial, SIKIKKK AYAAAAA!!! Platform BIMXZBUGXZ 2GB — QR Pairing Asli WhatsApp Baileys 6.7.18 + 25 Bug + Film & Anime",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800;900&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#050507] text-white antialiased selection:bg-[#FF1A1A] selection:text-white">
        {children}
      </body>
    </html>
  );
}
