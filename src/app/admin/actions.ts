'use server';

// Server action của web admin: gọi BE rồi làm mới trang. Lỗi của form tạo mới trả về qua ?error=.

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, API_URL, AdminApiError, adminApi } from '@/lib/admin';

const field = (form: FormData, key: string) => String(form.get(key) ?? '').trim();

export async function login(form: FormData) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: field(form, 'phone'), password: String(form.get('password') ?? '') }),
  });
  const session = await res.json().catch(() => null);
  if (!res.ok) redirect(`/admin/login?e=${session?.error ?? 'login'}`);
  const me = await fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${session.access_token}` } }).then((r) => r.json());
  if (!me?.roles?.includes('admin')) redirect('/admin/login?e=not_admin');
  (await cookies()).set(ADMIN_COOKIE, session.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/admin',
    maxAge: Math.max(60, session.expires_at - Math.floor(Date.now() / 1000)),
  });
  redirect('/admin');
}

export async function logout() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: '/admin' });
  redirect('/admin/login');
}

export async function setContractorStatus(form: FormData) {
  await adminApi(`/admin/contractors/${field(form, 'id')}`, { method: 'PATCH', body: { status: field(form, 'status') } });
  revalidatePath('/admin', 'layout');
}

export async function setPackageStatus(form: FormData) {
  await adminApi(`/admin/packages/${field(form, 'id')}`, { method: 'PATCH', body: { status: field(form, 'status') } });
  revalidatePath('/admin', 'layout');
}

export async function addMatch(form: FormData) {
  const id = field(form, 'request_id');
  try {
    await adminApi(`/admin/requests/${id}/matches`, { method: 'POST', body: { contractor_id: field(form, 'contractor_id') } });
  } catch (e) {
    if (e instanceof AdminApiError) redirect(`/admin/yeu-cau/${id}?error=${e.code}`);
    throw e;
  }
  revalidatePath('/admin', 'layout');
}

export async function createProject(form: FormData) {
  try {
    await adminApi('/admin/projects', {
      method: 'POST',
      body: {
        name: field(form, 'name'),
        slug: field(form, 'slug') || null,
        developer: field(form, 'developer') || null,
        province: field(form, 'province'),
        address: field(form, 'address') || null,
        handover_date: field(form, 'handover_date') || null,
        is_social_housing: form.get('is_social_housing') === 'on',
      },
    });
  } catch (e) {
    if (e instanceof AdminApiError) redirect(`/admin/du-an?error=${e.code}`);
    throw e;
  }
  revalidatePath('/admin/du-an');
  revalidatePath('/', 'layout');
}

export async function createUnitType(form: FormData) {
  try {
    await adminApi(`/admin/projects/${field(form, 'project_id')}/unit-types`, {
      method: 'POST',
      body: {
        name: field(form, 'name'),
        area_m2: Number(field(form, 'area_m2').replace(',', '.')),
        bedrooms: Number(field(form, 'bedrooms')),
        bathrooms: Number(field(form, 'bathrooms')),
      },
    });
  } catch (e) {
    if (e instanceof AdminApiError) redirect(`/admin/du-an?error=${e.code}`);
    throw e;
  }
  revalidatePath('/admin/du-an');
  revalidatePath('/', 'layout');
}
