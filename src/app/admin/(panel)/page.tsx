import Link from 'next/link';
import { adminApi, vnd } from '@/lib/admin';

type Stats = Record<'contractors_pending' | 'packages_pending' | 'requests_open' | 'requests_unmatched' | 'requests_7d' |
  'leads_7d' | 'jobs_active' | 'jobs_completed' | 'gmv', number>;

export default async function Dashboard() {
  const s = await adminApi<Stats>('/admin/stats');
  const todo: [string, number, string][] = [
    ['Nhà thầu chờ xác minh', s.contractors_pending, '/admin/nha-thau?status=pending'],
    ['Gói chờ duyệt', s.packages_pending, '/admin/goi?status=pending'],
    ['Yêu cầu chưa có nhà thầu', s.requests_unmatched, '/admin/yeu-cau?status=open'],
  ];
  const tiles: [string, string][] = [
    ['Yêu cầu 7 ngày', `${s.requests_7d}`],
    ['Lead landing 7 ngày', `${s.leads_7d}`],
    ['Yêu cầu đang mở', `${s.requests_open}`],
    ['Công trình đang thi công', `${s.jobs_active}`],
    ['Đã bàn giao', `${s.jobs_completed}`],
    ['GMV (giá hợp đồng)', vnd(s.gmv)],
  ];
  return (
    <>
      <h1>Tổng quan</h1>
      <h2>Cần xử lý</h2>
      <div className="tiles">
        {todo.map(([label, n, href]) => (
          <Link key={label} href={href} className={`tile ${n > 0 ? 'warn' : ''}`}><b>{n}</b><span>{label}</span></Link>
        ))}
      </div>
      <h2>Số liệu</h2>
      <div className="tiles">
        {tiles.map(([label, v]) => <div key={label} className="tile"><b>{v}</b><span>{label}</span></div>)}
      </div>
    </>
  );
}
