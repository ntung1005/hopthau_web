import Link from 'next/link';
import { adminApi } from '@/lib/admin';
import { logout } from '../actions';

type Stats = { contractors_pending: number; packages_pending: number; requests_unmatched: number };

export default async function Panel({ children }: Readonly<{ children: React.ReactNode }>) {
  // Gọi một lần ở layout: vừa kiểm tra đăng nhập, vừa lấy số việc cần làm cho menu.
  const s = await adminApi<Stats>('/admin/stats');
  const nav: [string, string, number?][] = [
    ['/admin', 'Tổng quan'],
    ['/admin/nha-thau', 'Nhà thầu', s.contractors_pending],
    ['/admin/goi', 'Gói nội thất', s.packages_pending],
    ['/admin/yeu-cau', 'Yêu cầu báo giá', s.requests_unmatched],
    ['/admin/lead', 'Lead landing'],
    ['/admin/du-an', 'Dự án & mẫu căn'],
    ['/admin/nhat-ky', 'Nhật ký'],
  ];
  return (
    <div className="shell">
      <nav className="sidebar" aria-label="Admin">
        <Link href="/admin" className="brand">Hợp Thầu <span>Admin</span></Link>
        <ul>
          {nav.map(([href, label, badge]) => (
            <li key={href}>
              <Link href={href}>{label}{badge ? <span className="badge">{badge}</span> : null}</Link>
            </li>
          ))}
        </ul>
        <form action={logout}><button className="ghost" type="submit">Đăng xuất</button></form>
      </nav>
      <main className="content">{children}</main>
    </div>
  );
}
