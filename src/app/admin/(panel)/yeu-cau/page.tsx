import Link from 'next/link';
import { adminApi, localPhone, vnd, vnDateTime } from '@/lib/admin';
import { StatusFilter } from '../filters';

export type AdminRequest = {
  id: string; address: string | null; budget: number | null; note: string | null; status: string; created_at: string;
  owner: { full_name: string; phone: string } | null;
  unit_type: { name: string; project: { name: string; province: string } } | null; package: { name: string } | null;
  matches: { status: string; price: number | null; contractor: { id: string; name: string } }[];
};

const LABEL: Record<string, string> = { open: 'Đang mở', matched: 'Đã chọn nhà thầu', closed: 'Đã đóng' };
export const place = (r: AdminRequest) => r.unit_type ? `${r.unit_type.project.name} · ${r.unit_type.name}` : r.address ?? '';

export default async function Requests({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const rows = await adminApi<AdminRequest[]>(`/admin/requests${status ? `?status=${status}` : ''}`);
  return (
    <>
      <h1>Yêu cầu báo giá</h1>
      <p className="muted">Yêu cầu đi từ gói tự ghép với nhà thầu của gói; yêu cầu theo địa chỉ tự ghép nhà thầu cùng khu vực. Dòng tô vàng là yêu cầu chưa có nhà thầu nào: cần ghép tay.</p>
      <StatusFilter base="/admin/yeu-cau" current={status} options={Object.entries(LABEL)} />
      <table>
        <thead><tr><th>Thời gian</th><th>Chủ nhà</th><th>Căn</th><th>Ngân sách</th><th>Nhà thầu (báo giá)</th><th>Trạng thái</th><th /></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={r.status === 'open' && r.matches.length === 0 ? 'attention' : ''}>
              <td className="small">{vnDateTime(r.created_at)}</td>
              <td>{r.owner?.full_name || '—'}<div className="small">{localPhone(r.owner?.phone)}</div></td>
              <td>{place(r)}{r.package && <div className="muted small">Gói {r.package.name}</div>}</td>
              <td>{r.budget ? vnd(r.budget) : '—'}</td>
              <td className="small">
                {r.matches.length === 0 ? <span className="muted">Chưa có</span> :
                  r.matches.map((m) => <div key={m.contractor.id}>{m.contractor.name}{m.price ? ` · ${vnd(m.price)}` : ''} <span className="muted">({m.status})</span></div>)}
              </td>
              <td><span className={`pill ${r.status}`}>{LABEL[r.status]}</span></td>
              <td><Link href={`/admin/yeu-cau/${r.id}`}>Chi tiết</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="muted">Không có yêu cầu nào.</p>}
    </>
  );
}
