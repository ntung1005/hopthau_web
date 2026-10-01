import Link from 'next/link';
import {
  getLatestReviews, getPackage, getPackages, getProject, getProjects, getShowcaseAll,
  reviewScore, vnd, vnDate, vndShort, type PackageDetail,
} from '@/lib/api';
import { FloorPlan } from './floor-plan';
import { LeadForm } from './lead-form';
import { ProjectPicker } from './project-picker';

export const revalidate = 300;

const TRUST: [string, string, string][] = [
  ['✓', 'Nhà thầu đã xác minh', 'Kiểm tra giấy phép kinh doanh trước khi hiển thị'],
  ['₫', 'Giá niêm yết theo hạng mục', 'Mỗi gói ghi rõ vật liệu, số lượng, đơn giá'],
  ['◷', '4 mốc nghiệm thu có ảnh', 'Duyệt từng phần việc ngay trên điện thoại'],
  ['⛨', 'Bảo hành theo gói', 'Tính từ ngày bàn giao, ghi trong ứng dụng'],
];

const STEPS: [string, string][] = [
  ['Chọn dự án', 'Tìm dự án bạn đã mua hoặc sắp nhận nhà.'],
  ['Chọn mẫu căn', 'Cùng mẫu căn là cùng mặt bằng, nên gói được thiết kế sẵn đúng kích thước.'],
  ['So sánh gói', 'Đặt tối đa 3 gói cạnh nhau: giá, hạng mục, thời gian, bảo hành.'],
  ['Nhận tư vấn', 'Nhà thầu gọi lại, khảo sát và chốt báo giá. Bạn chọn người phù hợp.'],
];

const MILESTONES: [string, string][] = [
  ['30%', 'Đặt cọc, chốt thiết kế'],
  ['40%', 'Sản xuất xong tại xưởng'],
  ['25%', 'Lắp đặt xong tại nhà'],
  ['5%', 'Nghiệm thu, bàn giao'],
];

const PROTECTIONS: [string, string][] = [
  ['Tiền đi theo tiến độ', 'Hợp đồng chia 4 mốc. Nhà thầu báo xong kèm ảnh, bạn nghiệm thu rồi mới thanh toán mốc đó. Chưa ưng thì bấm trả lại và ghi cần sửa gì.'],
  ['Không phát sinh ngầm', 'Mọi thay đổi giá hay thời gian phải thành "đề nghị phát sinh" trong ứng dụng. Bạn chưa đồng ý thì không được tính.'],
  ['Đánh giá thật', 'Chỉ chủ nhà có công trình đã bàn giao qua Hợp Thầu mới đánh giá được. Nhà thầu không tự đăng hay xoá đánh giá.'],
  ['Số điện thoại được giữ kín', 'Nhà thầu chỉ thấy số của bạn khi bạn chọn báo giá của họ. Không bị gọi làm phiền.'],
];

const FAQ: [string, string][] = [
  ['Giá trọn gói đã gồm những gì?', 'Là tổng các hạng mục bắt buộc liệt kê trong gói: tên, vật liệu, kích thước, số lượng, đơn giá. Hạng mục tuỳ chọn chỉ tính khi bạn chọn thêm. Vận chuyển, lắp đặt, VAT: hỏi nhà thầu khi được tư vấn và ghi vào báo giá.'],
  ['Nhà thầu được xác minh thế nào?', 'Đội vận hành kiểm tra giấy phép kinh doanh, mã số thuế và liên hệ trực tiếp trước khi cho hiển thị. Gói của nhà thầu chưa xác minh không hiện với chủ nhà.'],
  ['Thanh toán ra sao?', 'Theo 4 mốc: cọc 30%, sản xuất 40%, lắp đặt 25%, nghiệm thu 5%. Tiền chuyển thẳng cho nhà thầu sau khi bạn nghiệm thu từng mốc trong ứng dụng; Hợp Thầu ghi nhận để hai bên đối chiếu.'],
  ['Nếu cần thêm hoặc bớt hạng mục?', 'Nhà thầu gửi đề nghị phát sinh (số tiền, số ngày, lý do). Chỉ khi bạn bấm đồng ý thì tổng hợp đồng mới thay đổi.'],
  ['Bảo hành bao lâu?', 'Theo từng gói, thường 12–36 tháng, tính từ ngày bạn nghiệm thu mốc cuối. Hạn bảo hành hiện trong ứng dụng.'],
  ['Mất bao lâu để làm xong?', 'Mỗi gói ghi số ngày thi công, thường 3–5 tuần tuỳ khối lượng. Phát sinh được đồng ý có thể cộng thêm ngày.'],
  ['Có hỗ trợ trả góp không?', 'Chưa. Chúng tôi đang làm việc với đối tác tài chính và sẽ thông báo khi có.'],
];

export default async function Home() {
  // BE tắt lúc build vẫn render được trang, chỉ thiếu dữ liệu.
  const [projects, showcase, reviews] = await Promise.all([
    getProjects().catch(() => []), getShowcaseAll().catch(() => []), getLatestReviews().catch(() => []),
  ]);
  const details = (await Promise.all(projects.map((p) => getProject(p.slug).catch(() => null)))).filter((d) => d !== null);
  const minPrice = Math.min(...projects.map((p) => p.min_price ?? Infinity));

  // "Cùng một căn, nhiều mức ngân sách": mẫu căn có nhiều gói nhất.
  const units = details.flatMap((d) => d.unit_types.map((u) => ({ ...u, project: d })));
  const withPackages = await Promise.all(units.map(async (u) => ({ u, list: await getPackages(u.id).catch(() => []) })));
  const best = withPackages.filter((x) => x.list.length >= 2).sort((a, b) => b.list.length - a.list.length)[0];
  const compare = best
    ? (await Promise.all(best.list.slice(0, 3).map((p) => getPackage(p.id).catch(() => null)))).filter((p): p is PackageDetail => p !== null)
    : [];

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow">Hợp Thầu · Thầu hợp căn, hợp giá, hợp ý</p>
            <h1>
              Nội thất đúng mẫu căn của bạn
              {Number.isFinite(minPrice) && <>, <span className="hl">từ {vndShort(minPrice)}</span></>}
            </h1>
            <p className="lead">Giá niêm yết theo từng hạng mục, nhà thầu đã xác minh, theo dõi tiến độ và nghiệm thu bằng ảnh ngay trên điện thoại.</p>
            <ProjectPicker projects={details.map((d) => ({ slug: d.slug, name: d.name, unit_types: d.unit_types }))} />
            <p className="small hero-note">Chưa thấy dự án của bạn? <a href="#nhan-bao-gia">Để lại số</a>, chúng tôi báo khi có gói.</p>
          </div>
          <div className="hero-art" aria-hidden>
            <div className="plan-card"><FloorPlan className="plan" /></div>
            {compare[0] && (
              <div className="mock-card">
                <p className="small muted">{best!.u.project.name} · {best!.u.name}</p>
                <p className="mock-title">{compare[0].name}</p>
                <p className="mock-price">{vnd(compare[0].price)}</p>
                <p className="small">{compare[0].items.filter((i) => !i.is_optional).length} hạng mục · {compare[0].duration_days} ngày · BH {compare[0].warranty_months} tháng</p>
                <div className="mock-bar"><span style={{ width: '50%' }} /></div>
                <p className="small muted">2/4 mốc đã nghiệm thu</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="trust" aria-label="Cam kết">
        <ul className="wrap">
          {TRUST.map(([icon, title, body]) => (
            <li key={title}><span className="icon" aria-hidden>{icon}</span><div><b>{title}</b><span>{body}</span></div></li>
          ))}
        </ul>
      </section>

      <section id="cach-hoat-dong" className="section">
        <div className="wrap">
          <h2>4 bước, không cần đi khảo sát nhiều nơi</h2>
          <ol className="steps">
            {STEPS.map(([title, body]) => <li key={title}><h3>{title}</h3><p>{body}</p></li>)}
          </ol>
        </div>
      </section>

      {projects.length > 0 && (
        <section id="du-an" className="section soft">
          <div className="wrap">
            <h2>Dự án đang có gói nội thất</h2>
            <ul className="cards scroll">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link href={`/noi-that/${p.slug}`} className="card project">
                    <div className="card-top">
                      {p.is_social_housing && <span className="tag">NOXH</span>}
                      <span className="small muted">{p.unit_type_count} mẫu căn</span>
                    </div>
                    <h3>{p.name}</h3>
                    <p className="muted">{p.address ?? p.province}</p>
                    {p.handover_date && <p className="small muted">Bàn giao dự kiến {vnDate(p.handover_date)}</p>}
                    <p className="from">{p.min_price != null ? <>Từ <b>{vndShort(p.min_price)}</b></> : 'Sắp có gói'}</p>
                    <span className="link">Xem mẫu căn →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {compare.length >= 2 && (
        <section className="section">
          <div className="wrap">
            <h2>Cùng một căn, nhiều mức ngân sách</h2>
            <p className="muted">Ví dụ thật: {best!.u.project.name} · {best!.u.name}. Giá là tổng hạng mục, không phải &quot;liên hệ&quot;.</p>
            <div className="compare-cols">
              {compare.map((p, i) => (
                <article key={p.id} className={`plan-col ${i === 1 ? 'featured' : ''}`}>
                  <h3>{p.name}</h3>
                  <p className="muted small">{p.style} · {p.contractor.name}</p>
                  <p className="col-price">{vnd(p.price)}</p>
                  <ul>
                    {p.items.filter((it) => !it.is_optional).slice(0, 5).map((it) => (
                      <li key={it.room + it.name}>{it.room}: {it.name}{it.material ? ` (${it.material})` : ''}</li>
                    ))}
                  </ul>
                  <p className="small muted">{p.duration_days} ngày thi công · bảo hành {p.warranty_months} tháng</p>
                  <Link href={`/noi-that/${best!.u.project.slug}#${best!.u.id}`} className="button ghost small">Xem chi tiết</Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section soft">
        <div className="wrap">
          <h2>Căn giống căn bạn, đã hoàn thiện</h2>
          {showcase.length > 0 ? (
            <ul className="showcase">
              {showcase.map((sc) => (
                <li key={sc.job_id}>
                  {sc.photos[0] && <img src={sc.photos[0]} alt={`${sc.unit_type.name} do ${sc.contractor.name} thi công`} loading="lazy" />}
                  <div>
                    <b>{sc.unit_type.project.name} · {sc.unit_type.name}</b>
                    <p className="small"><Link href={`/nha-thau/${sc.contractor.id}`}>{sc.contractor.name}</Link>{sc.review && <> · ★ {reviewScore(sc.review)}</>}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-showcase"><FloorPlan className="plan" /><p className="muted">Ảnh công trình thực tế sẽ cập nhật khi các căn đầu tiên được bàn giao.</p></div>
          )}
        </div>
      </section>

      <section id="bao-ve" className="section">
        <div className="wrap">
          <h2>Tiền của bạn đi theo tiến độ</h2>
          <ol className="milestones" aria-label="4 mốc thanh toán">
            {MILESTONES.map(([pct, label], i) => (
              <li key={label}><span className="dot">{i + 1}</span><b>{pct}</b><span>{label}</span></li>
            ))}
          </ol>
          <div className="protect">
            {PROTECTIONS.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="section soft">
          <div className="wrap">
            <h2>Chủ nhà nói gì</h2>
            <ul className="quotes">
              {reviews.map((r) => (
                <li key={r.job_id}>
                  <p className="stars" aria-label={`${reviewScore(r)} trên 5`}>★ {reviewScore(r)}</p>
                  <blockquote>“{r.content}”</blockquote>
                  <p className="small"><b>{r.owner_name || 'Chủ nhà'}</b> · thi công bởi <Link href={`/nha-thau/${r.contractor.id}`}>{r.contractor.name}</Link></p>
                  <span className="tag ok">Đã bàn giao qua Hợp Thầu</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section id="nhan-bao-gia" className="section">
        <div className="wrap split">
          <div>
            <h2>Nhận báo giá cho căn của bạn trong 24 giờ</h2>
            <p className="muted">Để lại số, chúng tôi gọi lại để hỏi mẫu căn, ngân sách và gửi tới nhà thầu phù hợp. Miễn phí cho chủ nhà.</p>
            <ul className="checks">
              <li>Tối đa 5 nhà thầu báo giá, không bị làm phiền</li>
              <li>So sánh báo giá ngay trong ứng dụng</li>
              <li>Bạn quyết định chọn ai, hoặc không chọn ai</li>
            </ul>
          </div>
          <div className="form-card"><LeadForm source="home" projects={projects} /></div>
        </div>
      </section>

      <section className="band">
        <div className="wrap band-inner">
          <div>
            <h2>Bạn là nhà thầu, xưởng nội thất?</h2>
            <p>Đăng gói theo mẫu căn một lần, nhận khách từ hàng trăm căn cùng mẫu. Miễn phí giai đoạn đầu.</p>
          </div>
          <Link href="/cho-nha-thau" className="button">Đăng ký làm đối tác</Link>
        </div>
      </section>

      <section id="hoi-dap" className="section">
        <div className="wrap narrow">
          <h2>Câu hỏi thường gặp</h2>
          {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </div>
      </section>
    </>
  );
}
