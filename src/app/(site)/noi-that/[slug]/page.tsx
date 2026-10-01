import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPackages, getProject, getShowcase, reviewScore, vnd, vnDate, vndShort } from '@/lib/api';
import { LeadForm } from '../../lead-form';

// Trang SEO cho từng dự án: /noi-that/<dự án>, khớp cách người dùng tìm "nội thất + tên dự án". Render khi có người vào, cache 5 phút.
export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return {};
  return {
    title: `Nội thất ${project.name} · Gói trọn gói theo mẫu căn · Hợp Thầu`,
    description: `So sánh gói nội thất trọn gói cho từng mẫu căn ${project.name}, giá công khai từ nhà thầu đã xác minh.`,
  };
}

export default async function ProjectPage({ params }: Props) {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  const [packages, showcases] = await Promise.all([
    Promise.all(project.unit_types.map((u) => getPackages(u.id))),
    Promise.all(project.unit_types.map((u) => getShowcase(u.id))),
  ]);

  return (
    <>
      <section className="hero small">
        <div className="wrap">
        <h1>Nội thất {project.name}</h1>
        <p>
          {project.address ?? project.province}
          {project.developer && ` · ${project.developer}`}
          {project.handover_date && ` · bàn giao dự kiến ${vnDate(project.handover_date)}`}
        </p>
        </div>
      </section>

      {project.unit_types.map((u, i) => (
        <section key={u.id} id={u.id} className="wrap unit">
          <h2>
            {u.name} · {Number(u.area_m2).toLocaleString('vi-VN')} m² · {u.bedrooms} PN · {u.bathrooms} WC
            {u.min_price != null && <span className="from"> · từ <b>{vndShort(u.min_price)}</b></span>}
          </h2>
          {packages[i].length === 0 ? (
            <p className="muted">Chưa có gói cho mẫu căn này. Để lại số để được báo khi có gói.</p>
          ) : (
            <div className="table-wrap"><table className="compare">
              <thead><tr><th>Gói</th><th>Giá trọn gói</th><th>Phong cách</th><th>Thi công</th><th>Bảo hành</th><th>Nhà thầu</th></tr></thead>
              <tbody>
                {packages[i].map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td className="price">{vnd(p.price)}</td>
                    <td>{p.style}</td>
                    <td>{p.duration_days} ngày</td>
                    <td>{p.warranty_months} tháng</td>
                    <td>
                      <Link href={`/nha-thau/${p.contractor.id}`}>{p.contractor.name}</Link>
                      {p.contractor.status === 'verified' && <span className="verified" title="Đã xác minh">✓</span>}
                      {p.contractor.rating != null && ` · ★ ${p.contractor.rating}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
          {showcases[i].length > 0 && (
            <>
              <h3 className="sub">Căn {u.name} đã làm thực tế</h3>
              <ul className="showcase">
                {showcases[i].map((sc) => (
                  <li key={sc.job_id}>
                    {sc.photos[0] && <img src={sc.photos[0]} alt={`Căn ${u.name} do ${sc.contractor.name} thi công`} loading="lazy" />}
                    <div>
                      <Link href={`/nha-thau/${sc.contractor.id}`}>{sc.contractor.name}</Link>
                      {sc.review && <> · ★ {reviewScore(sc.review)}</>}
                      {sc.review?.content && <p className="muted">“{sc.review.content}”</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      ))}

      <section className="wrap narrow form-card unit">
        <h2>Nhận tư vấn cho căn của bạn tại {project.name}</h2>
        <LeadForm source={`project:${project.slug}`} projectId={project.id} />
      </section>
    </>
  );
}
