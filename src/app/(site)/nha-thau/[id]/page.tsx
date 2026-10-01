import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContractor, reviewScore, vndShort } from '@/lib/api';

// Hồ sơ nhà thầu công khai: chỉ nhà thầu đã xác minh (BE trả 404 cho nhà thầu khác).
export const revalidate = 300;

type Props = { params: Promise<{ id: string }> };

const CRITERIA = { quality: 'Chất lượng', punctuality: 'Đúng hạn', price_honesty: 'Đúng giá', attitude: 'Thái độ' } as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getContractor((await params).id).catch(() => null);
  if (!c) return {};
  return {
    title: `${c.name} · Nhà thầu nội thất đã xác minh · Hợp Thầu`,
    description: `${c.name}: ${c.completed_jobs} căn đã bàn giao, ${c.review_count} đánh giá từ công trình thực tế. Gói nội thất trọn gói giá công khai.`,
  };
}

export default async function ContractorPage({ params }: Props) {
  const c = await getContractor((await params).id);
  if (!c) notFound();
  return (
    <>
      <section className="hero small">
        <div className="wrap">
        <h1>{c.name} <span className="verified" title="Đã xác minh">✓</span></h1>
        <p>{[c.address, ...c.styles].filter(Boolean).join(' · ')}</p>
        <div className="stats">
          <div><b>{c.rating?.toLocaleString('vi-VN') ?? '-'}</b><span>điểm</span></div>
          <div><b>{c.review_count}</b><span>đánh giá</span></div>
          <div><b>{c.completed_jobs}</b><span>căn đã bàn giao</span></div>
        </div>
        </div>
      </section>

      {c.bio && <section className="wrap narrow unit"><h2>Giới thiệu</h2><p>{c.bio}</p></section>}

      <section className="wrap unit">
        <h2>Gói đang bán</h2>
        {c.packages.length === 0 ? <p className="muted">Chưa có gói đang hiển thị.</p> : (
          <ul className="cards">
            {c.packages.map((p) => (
              <li key={p.id}>
                <Link href={`/noi-that/${p.unit_type.project.slug}`} className="card">
                  <h3>{p.name}</h3>
                  <p>{p.unit_type.project.name} · {p.unit_type.name}</p>
                  <p className="from">{p.style} · <b>{vndShort(p.price)}</b></p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="wrap narrow unit">
        <h2>Đánh giá từ công trình đã bàn giao</h2>
        {c.reviews.length === 0 && <p className="muted">Chưa có đánh giá. Đánh giá chỉ đến từ công trình đã bàn giao qua Hợp Thầu.</p>}
        {c.reviews.map((r) => (
          <article key={r.job_id} className="review">
            <h3>{r.owner_name || 'Chủ nhà'} · ★ {reviewScore(r)}</h3>
            <p className="muted">{Object.entries(CRITERIA).map(([k, label]) => `${label} ${r[k as keyof typeof CRITERIA]}/5`).join(' · ')}</p>
            {r.content && <p>{r.content}</p>}
            {r.photos.length > 0 && (
              <div className="thumbs">{r.photos.map((u) => <img key={u} src={u} alt="Ảnh công trình thực tế" loading="lazy" />)}</div>
            )}
            {r.reply && <p className="reply">Nhà thầu trả lời: {r.reply}</p>}
          </article>
        ))}
      </section>
    </>
  );
}
