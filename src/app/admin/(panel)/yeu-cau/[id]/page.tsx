import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminApi, localPhone, vnd, vnDateTime } from '@/lib/admin';
import { addMatch } from '../../../actions';
import { place, type AdminRequest } from '../page';

type Suggestions = {
  remaining: number;
  contractors: { id: string; name: string; areas: string[]; styles: string[]; rating: number | null; review_count: number; area_match: boolean }[];
};

const ERRORS: Record<string, string> = {
  too_many_matches: 'Yêu cầu đã đủ 5 nhà thầu',
  already_matched: 'Nhà thầu này đã được ghép',
  request_closed: 'Chủ nhà đã chọn nhà thầu',
  contractor_not_verified: 'Nhà thầu chưa xác minh',
};

export default async function RequestDetail({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const rows = await adminApi<AdminRequest[]>('/admin/requests');
  const r = rows.find((x) => x.id === id);
  if (!r) notFound();
  const s = r.status === 'open' ? await adminApi<Suggestions>(`/admin/requests/${id}/suggestions`) : null;
  return (
    <>
      <p><Link href="/admin/yeu-cau">← Yêu cầu báo giá</Link></p>
      <h1>{place(r)}</h1>
      <div className="panel">
        <p>Chủ nhà: <b>{r.owner?.full_name || '—'}</b> · {localPhone(r.owner?.phone)} · gửi {vnDateTime(r.created_at)}</p>
        {r.package && <p>Gói: {r.package.name}</p>}
        {r.budget && <p>Ngân sách: {vnd(r.budget)}</p>}
        {r.note && <p>Ghi chú: {r.note}</p>}
      </div>
      <h2>Nhà thầu đã ghép ({r.matches.length}/5)</h2>
      {r.matches.length === 0 ? <p className="muted">Chưa có.</p> : (
        <ul>{r.matches.map((m) => <li key={m.contractor.id}>{m.contractor.name} · {m.status}{m.price ? ` · ${vnd(m.price)}` : ''}</li>)}</ul>
      )}
      {s && (
        <>
          <h2>Ghép thêm (còn {s.remaining})</h2>
          {error && <p className="error" role="alert">{ERRORS[error] ?? error}</p>}
          <table>
            <thead><tr><th>Nhà thầu</th><th>Khu vực</th><th>Phong cách</th><th>Điểm</th><th /></tr></thead>
            <tbody>
              {s.contractors.map((c) => (
                <tr key={c.id}>
                  <td><b>{c.name}</b></td>
                  <td>{c.areas.join(', ')} {c.area_match && <span className="pill verified">khớp khu vực</span>}</td>
                  <td className="small">{c.styles.join(', ')}</td>
                  <td>{c.rating ?? '—'} <span className="muted small">({c.review_count})</span></td>
                  <td>
                    {s.remaining > 0 && (
                      <form action={addMatch}>
                        <input type="hidden" name="request_id" value={id} />
                        <input type="hidden" name="contractor_id" value={c.id} />
                        <button type="submit">Ghép</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
