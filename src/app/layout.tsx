import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "鉄火場くん ダッシュボード",
  description: "リアルタイムで鉄火場の前兆・シグナルを監視",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[#0d1117]`}
      >
        <Header />
        <main className="flex-1 container mx-auto px-4 py-4 md:py-6 max-w-7xl">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
