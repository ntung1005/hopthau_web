'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type PickerProject = { slug: string; name: string; unit_types: { id: string; name: string }[] };

/** Ô chọn dự án → mẫu căn ở hero. Select native: dễ dùng trên điện thoại. */
export function ProjectPicker({ projects }: { projects: PickerProject[] }) {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [unit, setUnit] = useState('');
  const project = projects.find((p) => p.slug === slug);

  return (
    <form
      className="picker"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(slug ? `/noi-that/${slug}${unit ? `#${unit}` : ''}` : '/#du-an');
      }}
    >
      <label>
        <span>Dự án</span>
        <select value={slug} onChange={(e) => { setSlug(e.target.value); setUnit(''); }} required>
          <option value="">Chọn dự án của bạn</option>
          {projects.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
      </label>
      <label>
        <span>Mẫu căn</span>
        <select value={unit} onChange={(e) => setUnit(e.target.value)} disabled={!project}>
          <option value="">{project ? 'Tất cả mẫu căn' : 'Chọn dự án trước'}</option>
          {project?.unit_types.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </label>
      <button type="submit">Xem gói nội thất</button>
    </form>
  );
}
