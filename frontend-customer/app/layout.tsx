import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'QR Order Platform - Thực đơn',
  description: 'Đặt món qua QR Code - Nhà hàng Việt Nam',
};

// 👇 Tách viewport ra export riêng
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
