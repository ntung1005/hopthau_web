# Hợp Thầu web

Next.js (App Router), hai phần:

- **Landing** (`src/app/(site)`): trang chủ, `/noi-that/<dự-án>` (SEO, khớp cách người dùng tìm "nội thất + tên dự án"), `/nha-thau/<id>` (hồ sơ công khai), `/cho-nha-thau` (tuyển đối tác). Bố cục theo tham khảo Qanvast, Ohouse, Renonation, MOHO, Airbnb: hero chọn dự án → mẫu căn, thanh tin cậy, 4 bước, dự án có giá "từ", so sánh 3 gói thật, căn đã làm thực tế, 4 mốc thanh toán + cơ chế bảo vệ, đánh giá thật, form số điện thoại trước, FAQ, CTA dính đáy trên mobile. Không số liệu ảo, không đánh giá giả: phần nào chưa có dữ liệu thì ẩn hoặc hiện "sắp cập nhật".
- **Admin** (`src/app/admin`): đăng nhập bằng tài khoản có vai trò admin (`npm run make-admin` trong hopthau_be). Tổng quan việc cần làm, duyệt nhà thầu (xem MST, số điện thoại), duyệt gói (xem hạng mục, ảnh), yêu cầu báo giá + ghép tay theo gợi ý khu vực, lead landing, tạo dự án và mẫu căn, nhật ký thao tác. Token nằm trong cookie httpOnly, hết hạn sau 1 giờ thì đăng nhập lại. Dữ liệu lấy từ [hopthau_be](../hopthau_be), cache 5 phút.

```bash
npm install
cp .env.example .env.local   # API_URL (render trên server), NEXT_PUBLIC_API_URL (form trên trình duyệt), NEXT_PUBLIC_ZALO_URL / NEXT_PUBLIC_HOTLINE (nút liên hệ, trống thì ẩn)
npm run dev                  # http://localhost:3000
npm run build && npm run lint
```

| File | Nội dung |
|---|---|
| [src/app/(site)/page.tsx](src/app/(site)/page.tsx) | Trang chủ |
| [src/app/(site)/cho-nha-thau/page.tsx](src/app/(site)/cho-nha-thau/page.tsx) | Trang tuyển nhà thầu |
| [src/app/admin](src/app/admin) | Web admin: trang, server action ([actions.ts](src/app/admin/actions.ts)), gọi API ([src/lib/admin.ts](src/lib/admin.ts)) |
| [src/app/(site)/noi-that/[slug]/page.tsx](src/app/(site)/noi-that/[slug]/page.tsx) | Trang dự án: bảng gói theo từng mẫu căn, giá "từ", huy hiệu nhà thầu đã xác minh, form có gắn dự án |
| [src/app/(site)/nha-thau/[id]/page.tsx](src/app/(site)/nha-thau/[id]/page.tsx) | Hồ sơ nhà thầu công khai: điểm, gói đang bán, đánh giá kèm ảnh |
| [src/app/(site)/lead-form.tsx](src/app/(site)/lead-form.tsx) | Form gửi `POST /leads`, `source` cho biết form ở trang nào |
| [src/lib/api.ts](src/lib/api.ts) | Đọc danh mục từ BE |

Giao diện dùng cùng token với app (UI kit Coinpay), khai báo trong `:root` của [globals.css](src/app/globals.css).

Chưa có: Pixel Facebook/TikTok, GA4, blog, ảnh thật cho hero. Thêm Pixel trước khi chạy quảng cáo kiểm chứng.
