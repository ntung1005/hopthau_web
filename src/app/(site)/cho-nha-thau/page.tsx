import type { Metadata } from 'next';
import { LeadForm } from '../lead-form';

export const metadata: Metadata = {
  title: 'Đăng ký làm nhà thầu đối tác · Hợp Thầu',
  description: 'Đăng gói nội thất theo mẫu căn, nhận khách từ các dự án nhà ở xã hội sắp bàn giao. Miễn phí giai đoạn đầu.',
};

const WHY: [string, string][] = [
  ['Làm một lần, bán nhiều lần', 'Một dự án có hàng trăm căn cùng mẫu. Gói bạn làm cho mẫu căn đó hiện với mọi chủ nhà của mẫu căn.'],
  ['Khách đúng nhu cầu', 'Chủ nhà đã xem giá và hạng mục trước khi gọi, nên ít bị hỏi cho biết.'],
  ['Công cụ miễn phí', 'Báo giá theo hạng mục, quản lý công trình theo mốc, ảnh nghiệm thu, ghi nhận thanh toán.'],
  ['Uy tín tích luỹ', 'Đánh giá từ công trình thật và số căn đã bàn giao hiện trên hồ sơ công khai của bạn.'],
];

const STEPS = ['Để lại số, đội vận hành gọi lại trong 1 ngày làm việc', 'Tải ứng dụng, đăng ký hồ sơ nhà thầu', 'Xác minh giấy phép kinh doanh, mã số thuế', 'Đăng gói cho mẫu căn và nhận yêu cầu'];

export default function ForContractors() {
  return (
    <>
      <section className="hero">
        <div className="wrap narrow">
          <p className="eyebrow">Dành cho nhà thầu, xưởng nội thất</p>
          <h1>Nhận khách đúng dự án, đúng mẫu căn</h1>
          <p className="lead">Nhà ở xã hội bàn giao hàng loạt, cùng một mặt bằng. Đăng gói giá rõ ràng một lần, chủ nhà tự tìm đến.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap protect">
          {WHY.map(([t, b]) => <article key={t}><h3>{t}</h3><p>{b}</p></article>)}
        </div>
      </section>
      <section className="section soft">
        <div className="wrap split">
          <div>
            <h2>Bắt đầu thế nào</h2>
            <ol className="numbered">{STEPS.map((s) => <li key={s}>{s}</li>)}</ol>
            <p className="muted small">Miễn phí trong giai đoạn đầu. Sau đó thu phí trên hợp đồng chốt qua nền tảng; sẽ báo trước và bạn đồng ý mới áp dụng.</p>
          </div>
          <div className="form-card">
            <LeadForm source="contractor" cta="Đăng ký làm đối tác" notePlaceholder="Tên xưởng, khu vực nhận thi công, số năm kinh nghiệm..." />
          </div>
        </div>
      </section>
    </>
  );
}
