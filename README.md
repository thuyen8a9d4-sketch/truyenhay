# TruyệnHay

Nền tảng đọc & đăng tiểu thuyết online, miễn phí, lấy cảm hứng từ giao diện/chức năng của [webnovel.com](https://www.webnovel.com/vi). Bất kỳ ai cũng có thể đăng ký tài khoản, bật chế độ **tác giả** và đăng truyện/chương của riêng mình.

## Công nghệ

- **Next.js 16** (App Router, Server Actions, TypeScript, Tailwind CSS v4)
- **Supabase** (Postgres, Auth, Storage) — toàn bộ dữ liệu và xác thực
- **Vercel** — hosting miễn phí, tự động deploy khi push code lên GitHub

Toàn bộ ngăn xếp đều có gói miễn phí, phù hợp để tự host mà không tốn chi phí.

## Chức năng chính

- Trang chủ với truyện nổi bật, thịnh hành, mới cập nhật, mới đăng
- Duyệt truyện theo thể loại, trạng thái, sắp xếp + tìm kiếm
- Trang chi tiết truyện: mô tả, thể loại, danh sách chương, đánh giá sao + nhận xét
- Trang đọc chương: điều hướng chương trước/sau, đổi cỡ chữ & nền (tối/sáng/sepia), tự lưu tiến độ đọc, bình luận theo chương
- Thư viện cá nhân: theo dõi truyện đã lưu + tiến độ đọc
- Bảng xếp hạng theo lượt xem / đánh giá / mới nhất
- Trang tác giả: tạo/sửa/xoá truyện, quản lý chương, tải ảnh bìa

## Chạy dự án ở máy local

```bash
npm install
cp .env.local.example .env.local   # rồi điền thông tin Supabase (xem DEPLOY.md)
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Cấu trúc thư mục

```
app/            Các route (App Router)
components/     UI components dùng chung
lib/            Supabase clients, truy vấn dữ liệu, Server Actions, tiện ích
supabase/       Migration SQL + seed data
proxy.ts        Middleware Next.js 16 (làm mới session Supabase)
```

## Triển khai miễn phí

Xem hướng dẫn chi tiết từng bước tại [DEPLOY.md](./DEPLOY.md) để đưa dự án lên **Supabase + GitHub + Vercel** hoàn toàn miễn phí.
