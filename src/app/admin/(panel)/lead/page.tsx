import { adminApi, localPhone, vnDateTime } from '@/lib/admin';

type Lead = { id: string; name: string; phone: string; note: string | null; source: string | null; created_at: string; project: { name: string } | null };

export default async function Leads() {
  const rows = await adminApi<Lead[]>('/admin/leads');
  return (
    <>
      <h1>Lead landing</h1>
      <p className="muted">Người để lại số trên landing page. <code>source</code> cho biết form ở trang nào (home, contractor, project:&lt;slug&gt;).</p>
      <table>
        <thead><tr><th>Thời gian</th><th>Tên</th><th>Số điện thoại</th><th>Dự án</th><th>Nguồn</th><th>Ghi chú</th></tr></thead>
        <tbody>
          {rows.map((l) => (
            <tr key={l.id}>
              <td className="small">{vnDateTime(l.created_at)}</td>
              <td>{l.name}</td>
              <td><a href={`tel:${localPhone(l.phone)}`}>{localPhone(l.phone)}</a></td>
              <td>{l.project?.name ?? '—'}</td>
              <td><span className="pill">{l.source ?? '—'}</span></td>
              <td className="small">{l.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="muted">Chưa có lead.</p>}
    </>
  );
}
