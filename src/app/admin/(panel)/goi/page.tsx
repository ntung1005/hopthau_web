import { adminApi, vnd, vnDateTime } from '@/lib/admin';
import { setPackageStatus } from '../../actions';
import { StatusButton, StatusFilter } from '../filters';

type Item = { room: string; name: string; material: string | null; size: string | null; qty: number; unit: string; unit_price: number; is_optional: boolean };
type Pkg = {
  id: string; name: string; style: string; duration_days: number; warranty_months: number; images: string[]; status: string;
  updated_at: string; price: number; contractor: { name: string; status: string };
  unit_type: { name: string; area_m2: number; project: { name: string } }; items: Item[];
};

const LABEL: Record<string, string> = { pending: 'Chờ duyệt', published: 'Đang hiển thị', hidden: 'Đã ẩn', draft: 'Nháp' };

export default async function Packages({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const rows = await adminApi<Pkg[]>(`/admin/packages${status ? `?status=${status}` : ''}`);
  return (
    <>
      <h1>Gói nội thất</h1>
      <p className="muted">Kiểm tra hạng mục có đủ vật liệu, kích thước, đơn giá hợp lý trước khi cho hiển thị. Gói chỉ hiện khi nhà thầu đã xác minh.</p>
      <StatusFilter base="/admin/goi" current={status} options={Object.entries(LABEL)} />
      {rows.map((p) => (
        <article key={p.id} className="panel">
          <header className="row">
            <div>
              <h3>{p.name} <span className={`pill ${p.status}`}>{LABEL[p.status]}</span></h3>
              <p className="muted small">
                {p.unit_type.project.name} · {p.unit_type.name} ({p.unit_type.area_m2} m²) · {p.contractor.name}
                {p.contractor.status !== 'verified' && <b className="error"> (nhà thầu chưa xác minh)</b>} · sửa {vnDateTime(p.updated_at)}
              </p>
            </div>
            <div className="price">{vnd(p.price)}</div>
          </header>
          <p className="small">{p.style} · {p.duration_days} ngày · bảo hành {p.warranty_months} tháng · {p.items.length} hạng mục · {p.images.length} ảnh</p>
          {p.images.length > 0 && <div className="thumbs">{p.images.map((u) => <img key={u} src={u} alt="" />)}</div>}
          <details>
            <summary>Xem hạng mục</summary>
            <table>
              <thead><tr><th>Phòng</th><th>Hạng mục</th><th>Vật liệu · kích thước</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
              <tbody>
                {p.items.map((i, n) => (
                  <tr key={n} className={i.is_optional ? 'muted' : ''}>
                    <td>{i.room}</td><td>{i.name}{i.is_optional && ' (tuỳ chọn)'}</td>
                    <td className="small">{[i.material, i.size].filter(Boolean).join(' · ')}</td>
                    <td>{i.qty} {i.unit}</td><td>{vnd(i.unit_price)}</td><td>{vnd(Math.round(i.qty * i.unit_price))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
          <div className="actions">
            {p.status !== 'published' && <StatusButton action={setPackageStatus} id={p.id} status="published" label="Cho hiển thị" />}
            {p.status !== 'hidden' && <StatusButton action={setPackageStatus} id={p.id} status="hidden" label="Ẩn" tone="danger" />}
            {p.status === 'pending' && <StatusButton action={setPackageStatus} id={p.id} status="draft" label="Trả về nháp" tone="ghost" />}
          </div>
        </article>
      ))}
      {rows.length === 0 && <p className="muted">Không có gói nào.</p>}
    </>
  );
}
