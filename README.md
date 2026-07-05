# VanThu

Nền tảng đọc & đăng tiểu thuyết online, miễn phí, lấy cảm hứng từ giao diện/chức năng của [webnovel.com](https://www.webnovel.com/vi). Bất kỳ ai cũng có thể đăng ký tài khoản, gửi đơn xin làm **tác giả** (cần admin duyệt) và đăng truyện/chương của riêng mình sau khi truyện được duyệt.

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
- **Phân quyền 3 vai trò (Reader/Author/Admin)**: đăng ký tự do ở vai Reader; xin làm Author qua **Đơn xin làm tác giả** cần Admin duyệt; Admin được cấp thủ công qua SQL. Không thể tự nâng quyền qua API (chặn ở tầng database).
- **Duyệt truyện**: mọi truyện mới phải được Admin duyệt ở trang **Quản trị — Duyệt truyện** mới hiển thị công khai; tác giả phải đồng ý Hợp đồng điện tử trước khi đăng.
- **Hệ thống xu & khoá chương trả phí**: tác giả có thể khoá chương và đặt giá xu (giới hạn tối đa 10 xu/chương cho truyện mới, 100 xu/chương sau khi đạt 10.000 lượt xem — chặn ở tầng database); độc giả trả xu để mở khoá. Doanh thu chia tự động 60% tác giả / 40% nền tảng, tỉ giá 1 xu = 1.000đ.
- **Rút tiền**: tác giả có truyện đạt tối thiểu 2.000 lượt xem và 20.000 chữ có thể gửi yêu cầu rút tiền; Admin xử lý thủ công ở trang **Quản trị — Duyệt rút tiền**.
- **Thông báo hệ thống**: chuông thông báo trong navbar báo kết quả duyệt đơn/truyện/rút tiền.
- **Trang Nạp xu** (thủ công qua chuyển khoản + admin xác nhận, chưa kết nối cổng thanh toán thật) và **Sao kê thu nhập** cho tác giả/admin để tự khai thuế (xem thêm ở [DEPLOY.md](./DEPLOY.md))

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
