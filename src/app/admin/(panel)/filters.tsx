import Link from 'next/link';

/** Hàng nút lọc theo trạng thái (?status=). */
export function StatusFilter({ base, current, options }: { base: string; current?: string; options: [string, string][] }) {
  return (
    <div className="filters">
      <Link href={base} className={!current ? 'on' : ''}>Tất cả</Link>
      {options.map(([v, label]) => (
        <Link key={v} href={`${base}?status=${v}`} className={current === v ? 'on' : ''}>{label}</Link>
      ))}
    </div>
  );
}

export function StatusButton({ action, id, status, label, tone }: {
  action: (f: FormData) => Promise<void>; id: string; status: string; label: string; tone?: 'danger' | 'ghost';
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={tone}>{label}</button>
    </form>
  );
}
