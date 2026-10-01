import { adminApi, localPhone, vnDateTime } from '@/lib/admin';
import { setContractorStatus } from '../../actions';
import { StatusButton, StatusFilter } from '../filters';

type Contractor = {
  id: string; name: string; tax_code: string | null; address: string | null; areas: string[]; styles: string[];
  bio: string | null; status: string; rating: number | null; review_count: number; created_at: string;
  owner: { full_name: string; phone: string } | null; packages: { count: number }[];
};

const LABEL: Record<string, string> = { pending: 'Chờ xác minh', verified: 'Đã xác minh', rejected: 'Từ chối' };

export default async function Contractors({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const rows = await adminApi<Contractor[]>(`/admin/contractors${status ? `?status=${status}` : ''}`);
  return (
    <>
      <h1>Nhà thầu</h1>
      <p className="muted">Gọi xác minh giấy phép kinh doanh / mã số thuế, nếu được thì ghé xưởng, rồi mới bấm Xác minh.</p>
      <StatusFilter base="/admin/nha-thau" current={status} options={Object.entries(LABEL)} />
      <table>
        <thead><tr><th>Nhà thầu</th><th>Liên hệ</th><th>MST</th><th>Khu vực · phong cách</th><th>Gói</th><th>Điểm</th><th>Trạng thái</th><th /></tr></thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id}>
              <td><b>{c.name}</b><div className="muted small">{c.address}</div><div className="muted small">Đăng ký {vnDateTime(c.created_at)}</div></td>
              <td>{c.owner?.full_name}<div className="small">{localPhone(c.owner?.phone)}</div></td>
              <td>{c.tax_code ?? <span className="muted">—</span>}</td>
              <td className="small">{c.areas.join(', ')}<div className="muted">{c.styles.join(', ')}</div></td>
              <td>{c.packages[0]?.count ?? 0}</td>
              <td>{c.rating ?? '—'}<div className="muted small">{c.review_count} đánh giá</div></td>
              <td><span className={`pill ${c.status}`}>{LABEL[c.status]}</span></td>
              <td className="actions">
                {c.status !== 'verified' && <StatusButton action={setContractorStatus} id={c.id} status="verified" label="Xác minh" />}
                {c.status !== 'rejected' && <StatusButton action={setContractorStatus} id={c.id} status="rejected" label="Từ chối" tone="danger" />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="muted">Không có nhà thầu nào.</p>}
    </>
  );
}
