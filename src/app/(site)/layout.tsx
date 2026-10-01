import Link from 'next/link';
import { HOTLINE, ZALO_URL } from '@/lib/api';

const NAV: [string, string][] = [
  ['/#du-an', 'Dự án'],
  ['/#cach-hoat-dong', 'Cách hoạt động'],
  ['/#bao-ve', 'Bảo vệ chủ nhà'],
  ['/cho-nha-thau', 'Cho nhà thầu'],
];

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const contact = ZALO_URL
    ? { href: ZALO_URL, label: 'Chat Zalo' }
    : HOTLINE ? { href: `tel:${HOTLINE}`, label: `Gọi ${HOTLINE}` } : { href: '/#nhan-bao-gia', label: 'Nhận tư vấn' };
  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <Link href="/" className="brand"><span className="logo" aria-hidden>▦</span> Hợp Thầu</Link>
          <nav aria-label="Chính">
            {NAV.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
          </nav>
          <a href={contact.href} className="button small">{contact.label}</a>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="wrap cols">
          <div>
            <p className="brand"><span className="logo" aria-hidden>▦</span> Hợp Thầu</p>
            <p className="muted">Nội thất trọn gói theo mẫu căn cho căn hộ nhà ở xã hội và chung cư mới bàn giao. Giá công khai, thanh toán theo tiến độ.</p>
          </div>
          <div>
            <h3>Chủ nhà</h3>
            <Link href="/#du-an">Dự án có gói nội thất</Link>
            <Link href="/#bao-ve">Cam kết bảo vệ chủ nhà</Link>
            <Link href="/#hoi-dap">Câu hỏi thường gặp</Link>
          </div>
          <div>
            <h3>Nhà thầu</h3>
            <Link href="/cho-nha-thau">Đăng ký làm đối tác</Link>
            {HOTLINE && <a href={`tel:${HOTLINE}`}>Hotline {HOTLINE}</a>}
            {ZALO_URL && <a href={ZALO_URL}>Zalo</a>}
          </div>
        </div>
        <p className="wrap muted small">© {new Date().getFullYear()} Hợp Thầu · Dữ liệu dự án hiện là dữ liệu mẫu</p>
      </footer>
      {/* Mobile: CTA luôn trong tầm tay cái. */}
      <div className="mobile-cta">
        <Link href="/#nhan-bao-gia" className="button">Nhận báo giá</Link>
        {(ZALO_URL || HOTLINE) && <a href={contact.href} className="button ghost">{contact.label}</a>}
      </div>
    </>
  );
}
