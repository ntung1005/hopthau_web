'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8788';

const ERRORS: Record<string, string> = {
  invalid_phone: 'Số điện thoại chưa đúng (10 số, bắt đầu bằng 0)',
  missing_name: 'Vui lòng cho biết tên để tiện xưng hô',
  too_many_attempts: 'Bạn gửi hơi nhiều, thử lại sau vài phút nhé',
};

/** Form "để lại số": gửi lead về BE. `source` để biết form nằm ở trang nào. Số điện thoại đặt đầu tiên. */
export function LeadForm({ source, projectId, projects, cta = 'Gọi lại cho tôi', notePlaceholder }: {
  source: string;
  projectId?: string;
  projects?: { id: string; name: string }[];
  cta?: string;
  notePlaceholder?: string;
}) {
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  async function submit(form: FormData) {
    setState('sending');
    setError('');
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          phone: form.get('phone'),
          note: form.get('note') || null,
          project_id: projectId ?? (form.get('project_id') || null),
          source,
        }),
      });
      if (res.ok) return setState('done');
      const { error: code } = await res.json().catch(() => ({ error: '' }));
      setError(ERRORS[code] ?? 'Có lỗi xảy ra, vui lòng thử lại');
    } catch {
      setError('Không kết nối được, vui lòng thử lại');
    }
    setState('idle');
  }

  if (state === 'done') {
    return <p className="notice" role="status">Cảm ơn bạn! Chúng tôi sẽ gọi lại trong giờ hành chính, thường trong 24 giờ.</p>;
  }
  return (
    <form action={submit} className="lead-form">
      <label>Số điện thoại<input name="phone" required inputMode="tel" autoComplete="tel" placeholder="09xx xxx xxx" /></label>
      <label>Tên của bạn<input name="name" required maxLength={100} autoComplete="given-name" placeholder="Anh / chị ..." /></label>
      {projects && projects.length > 0 && (
        <label>Dự án
          <select name="project_id" defaultValue="">
            <option value="">Chưa chọn / dự án khác</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
      )}
      <label>Ghi chú<textarea name="note" maxLength={1000} rows={2} placeholder={notePlaceholder ?? 'Mẫu căn, ngày nhận nhà, ngân sách...'} /></label>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Đang gửi...' : cta}</button>
      <p className="muted small">Chỉ dùng để tư vấn cho bạn, không chia sẻ cho bên thứ ba. Số điện thoại chỉ gửi cho nhà thầu khi bạn đồng ý.</p>
    </form>
  );
}
