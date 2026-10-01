import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = { title: 'Hợp Thầu Admin', robots: { index: false, follow: false } };

export default function AdminRoot({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin">{children}</div>;
}
