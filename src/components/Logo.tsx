"use client";
import { useState } from "react";
import { LOGO_80_BASE64, LOGO_200_BASE64 } from "@/lib/logoData";

export function Logo({ variant = "small", className = "w-full h-full object-cover", alt = "BIMXZBUGXZ" }: { variant?: "small" | "large"; className?: string; alt?: string }) {
  const inline = variant === "small" ? LOGO_80_BASE64 : LOGO_200_BASE64;
  const [src, setSrc] = useState("/logo-bimx.png");
  const [tried, setTried] = useState(0);
  const fallbacks = ["/logo-bimx.png", "/logo-bimx-512.png", "/logo-bimx.webp", inline];

  const handleError = () => {
    if (tried < fallbacks.length - 1) {
      const next = tried + 1;
      setSrc(fallbacks[next]);
      setTried(next);
    }
  };

  // If inline is the last fallback, use it directly if public fails quickly
  return <img src={src} alt={alt} className={className} onError={handleError} loading="eager" />;
}

export function LogoWithFallback({ size = 80, className = "" }: { size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-[#FF1A1A] to-black text-white font-black ${className}`} style={{ width: size, height: size }}>
        <span style={{ fontSize: size * 0.18, fontFamily: "Orbitron" }}>BIMXZ</span>
      </div>
    );
  }
  return (
    <img
      src="/logo-bimx.png"
      alt="BIMXZBUGXZ"
      className={className}
      style={{ width: size, height: size, objectFit: "cover" }}
      onError={() => setFailed(true)}
    />
  );
}
