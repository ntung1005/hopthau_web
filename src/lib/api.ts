// Đọc danh mục từ BE (hopthau_be). Cache 5 phút: dự án, gói ít khi đổi.

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:8788';

export interface Project {
  id: string;
  slug: string;
  name: string;
  developer: string | null;
  province: string;
  address: string | null;
  handover_date: string | null;
  unit_type_count: number;
  is_social_housing: boolean;
  min_price: number | null;
}

export interface UnitType {
  id: string;
  name: string;
  area_m2: number;
  bedrooms: number;
  bathrooms: number;
  min_price: number | null;
}

export interface Package {
  id: string;
  name: string;
  style: string;
  price: number;
  duration_days: number;
  warranty_months: number;
  contractor: { id: string; name: string; rating: number | null; status: string };
}

async function get<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 300 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`BE ${path}: ${res.status}`);
  return res.json();
}

export const getProjects = async () => (await get<Project[]>('/projects')) ?? [];
export const getProject = (slug: string) => get<Project & { unit_types: UnitType[] }>(`/projects/${slug}`);
export interface Review {
  job_id: string;
  owner_name: string;
  quality: number;
  punctuality: number;
  price_honesty: number;
  attitude: number;
  content: string | null;
  photos: string[];
  reply: string | null;
}

export interface Contractor {
  id: string;
  name: string;
  address: string | null;
  areas: string[];
  styles: string[];
  bio: string | null;
  rating: number | null;
  review_count: number;
  completed_jobs: number;
  packages: (Omit<Package, 'contractor'> & { unit_type: { name: string; project: { slug: string; name: string } } })[];
  reviews: Review[];
}

export interface Showcase {
  job_id: string;
  contractor: { id: string; name: string; rating: number | null };
  photos: string[];
  review: Pick<Review, 'quality' | 'punctuality' | 'price_honesty' | 'attitude' | 'content'> | null;
}

export interface LatestReview extends Pick<Review, 'job_id' | 'owner_name' | 'quality' | 'punctuality' | 'price_honesty' | 'attitude' | 'content'> {
  contractor: { id: string; name: string };
}

export interface PackageDetail extends Package {
  items: { room: string; name: string; material: string | null; is_optional: boolean }[];
}

export const getPackage = (id: string) => get<PackageDetail>(`/packages/${id}`);
export const getShowcaseAll = async () =>
  (await get<(Showcase & { unit_type: { name: string; project: { slug: string; name: string } } })[]>('/showcase')) ?? [];
export const getLatestReviews = async () => (await get<LatestReview[]>('/reviews/latest')) ?? [];

/** Liên hệ nhanh: đặt trong .env khi có Zalo OA / hotline thật. Trống thì ẩn nút. */
export const ZALO_URL = process.env.NEXT_PUBLIC_ZALO_URL ?? '';
export const HOTLINE = process.env.NEXT_PUBLIC_HOTLINE ?? '';

export const getContractor = (id: string) => get<Contractor>(`/contractors/${id}`);
export const getShowcase = async (unitTypeId: string) => (await get<Showcase[]>(`/unit-types/${unitTypeId}/showcase`)) ?? [];
export const reviewScore = (r: Pick<Review, 'quality' | 'punctuality' | 'price_honesty' | 'attitude'>) =>
  ((r.quality + r.punctuality + r.price_honesty + r.attitude) / 4).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
export const getPackages = async (unitTypeId: string) =>
  (await get<Package[]>(`/unit-types/${unitTypeId}/packages`)) ?? [];

export const vnd = (n: number) => `${n.toLocaleString('vi-VN')} đ`;
/** 31960000 -> "32 triệu" */
export const vndShort = (n: number) =>
  n < 1_000_000 ? vnd(n) : `${(Math.round(n / 100_000) / 10).toLocaleString('vi-VN')} triệu`;
export const vnDate = (iso: string) => new Date(iso).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
