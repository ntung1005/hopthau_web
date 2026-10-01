// Gọi API admin của BE từ server component / server action. Token nằm trong cookie httpOnly,
// trình duyệt không đọc được. ponytail: không tự làm mới token, hết hạn (1 giờ) thì đăng nhập lại.

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const API_URL = process.env.API_URL ?? 'http://127.0.0.1:8788';
export const ADMIN_COOKIE = 'ht_admin';

export class AdminApiError extends Error {
  constructor(readonly status: number, readonly code: string) {
    super(code);
  }
}

export async function adminApi<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) redirect('/admin/login');
  const res = await fetch(API_URL + path, {
    method: init.method ?? 'GET',
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (res.status === 401 || res.status === 403) redirect('/admin/login?e=session');
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new AdminApiError(res.status, data?.error ?? `http_${res.status}`);
  return data as T;
}

export const vnd = (n: number) => `${Number(n).toLocaleString('vi-VN')} đ`;
export const vnDateTime = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' });
export const localPhone = (p: string | null | undefined) => (p ? `0${p.slice(2)}` : '');
