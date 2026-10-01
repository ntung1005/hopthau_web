import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';

// Font thiết kế cho tiếng Việt: dấu không bị chồng, không lệch dòng.
const font = Be_Vietnam_Pro({ subsets: ['vietnamese', 'latin'], weight: ['400', '500', '600', '700'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Hợp Thầu · Thầu nội thất hợp căn, hợp giá, hợp ý',
  description: 'Chọn dự án, chọn mẫu căn, so sánh gói nội thất trọn gói từ nhà thầu đã xác minh. Giá công khai, không phát sinh.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={font.className}>
      <body>{children}</body>
    </html>
  );
}
