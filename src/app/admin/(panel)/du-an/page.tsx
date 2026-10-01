import Link from 'next/link';
import { adminApi } from '@/lib/admin';
import { createProject, createUnitType } from '../../actions';

type Project = {
  id: string; slug: string; name: string; developer: string | null; province: string; address: string | null;
  handover_date: string | null; is_social_housing: boolean;
  unit_types: { id: string; name: string; area_m2: number; bedrooms: number; bathrooms: number }[];
};

const ERRORS: Record<string, string> = {
  slug_taken: 'Slug đã có dự án khác dùng', invalid_slug: 'Slug chỉ gồm a-z, 0-9 và dấu gạch',
  unit_type_exists: 'Dự án đã có mẫu căn tên này', missing_name: 'Thiếu tên', missing_province: 'Thiếu tỉnh / thành',
};

export default async function Projects({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const rows = await adminApi<Project[]>('/admin/projects');
  return (
    <>
      <h1>Dự án & mẫu căn</h1>
      {error && <p className="error" role="alert">{ERRORS[error] ?? `Lỗi: ${error}`}</p>}
      <details className="panel" open={rows.length === 0}>
        <summary>+ Thêm dự án</summary>
        <form action={createProject} className="grid-form">
          <label>Tên dự án<input name="name" required /></label>
          <label>Slug (để trống: tự tạo)<input name="slug" pattern="[a-z0-9-]+" placeholder="noxh-song-hong" /></label>
          <label>Chủ đầu tư<input name="developer" /></label>
          <label>Tỉnh / thành<input name="province" required placeholder="Hà Nội" /></label>
          <label>Địa chỉ<input name="address" placeholder="Long Biên, Hà Nội" /></label>
          <label>Bàn giao dự kiến<input name="handover_date" type="date" /></label>
          <label className="check"><input name="is_social_housing" type="checkbox" defaultChecked /> Nhà ở xã hội</label>
          <button type="submit">Thêm dự án</button>
        </form>
      </details>
      {rows.map((p) => (
        <article key={p.id} className="panel">
          <h3>{p.name} {p.is_social_housing && <span className="pill">NOXH</span>}</h3>
          <p className="muted small">
            {[p.address ?? p.province, p.developer, p.handover_date && `bàn giao ${p.handover_date}`].filter(Boolean).join(' · ')} ·{' '}
            <Link href={`/noi-that/${p.slug}`}>/noi-that/{p.slug}</Link>
          </p>
          <table>
            <thead><tr><th>Mẫu căn</th><th>Diện tích</th><th>PN</th><th>WC</th></tr></thead>
            <tbody>
              {p.unit_types.map((u) => (
                <tr key={u.id}><td>{u.name}</td><td>{u.area_m2} m²</td><td>{u.bedrooms}</td><td>{u.bathrooms}</td></tr>
              ))}
            </tbody>
          </table>
          <form action={createUnitType} className="inline-form">
            <input type="hidden" name="project_id" value={p.id} />
            <input name="name" required placeholder="Mẫu C · 2PN" aria-label="Tên mẫu căn" />
            <input name="area_m2" required inputMode="decimal" placeholder="m²" aria-label="Diện tích m²" />
            <input name="bedrooms" required type="number" min={0} max={10} placeholder="PN" aria-label="Phòng ngủ" />
            <input name="bathrooms" required type="number" min={0} max={10} placeholder="WC" aria-label="WC" />
            <button type="submit">+ Mẫu căn</button>
          </form>
        </article>
      ))}
    </>
  );
}
