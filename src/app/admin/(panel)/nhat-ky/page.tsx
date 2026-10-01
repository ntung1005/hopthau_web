import { adminApi, localPhone, vnDateTime } from '@/lib/admin';

type Entry = { id: number; action: string; target_id: string | null; data: Record<string, unknown>; created_at: string;
  actor: { full_name: string; phone: string } | null };

export default async function Audit() {
  const rows = await adminApi<Entry[]>('/admin/audit');
  return (
    <>
      <h1>Nhật ký thao tác</h1>
      <table>
        <thead><tr><th>Thời gian</th><th>Người làm</th><th>Thao tác</th><th>Đối tượng</th></tr></thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id}>
              <td className="small">{vnDateTime(e.created_at)}</td>
              <td>{e.actor?.full_name || localPhone(e.actor?.phone) || '—'}</td>
              <td><code>{e.action}</code></td>
              <td className="small">{String(e.data.name ?? '')} <span className="muted">{e.target_id?.slice(0, 8)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="muted">Chưa có thao tác.</p>}
    </>
  );
}
