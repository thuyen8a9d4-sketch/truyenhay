# Hướng dẫn triển khai miễn phí (Supabase + GitHub + Vercel)

Làm theo đúng thứ tự 3 bước dưới đây. Toàn bộ đều dùng gói miễn phí.

## Bước 1: Tạo project Supabase (database + đăng nhập + lưu ảnh)

1. Vào [supabase.com](https://supabase.com) → đăng ký/đăng nhập → **New project**.
2. Đặt tên project, đặt mật khẩu database (lưu lại), chọn region gần Việt Nam (Singapore).
3. Đợi project khởi tạo xong (khoảng 1-2 phút).
4. Vào **SQL Editor** (menu bên trái) → **New query**.
5. Mở file [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) trong dự án, copy toàn bộ nội dung, dán vào SQL Editor, bấm **Run**.
6. Làm tương tự với file [`supabase/migrations/0002_monetization.sql`](./supabase/migrations/0002_monetization.sql) — file này tạo hệ thống xu, khoá chương trả phí, chia doanh thu tác giả/nền tảng.
7. Làm tương tự với file [`supabase/seed.sql`](./supabase/seed.sql) để tạo sẵn danh sách thể loại.
8. Vào **Project Settings > API**, lấy 2 giá trị:
   - **Project URL** → dùng cho `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** (hoặc **Publishable key** ở dashboard mới) → dùng cho `NEXT_PUBLIC_SUPABASE_ANON_KEY`
9. (Tuỳ chọn) Vào **Authentication > Sign In / Providers**, có thể tắt "Confirm email" nếu muốn người dùng đăng nhập ngay sau khi đăng ký mà không cần xác nhận email — hữu ích khi mới demo dự án.

## Bước 2: Đưa code lên GitHub

Trong thư mục dự án:

```bash
git init
git add .
git commit -m "Khởi tạo VanThu"
```

Sau đó tạo một repository mới (trống, không tạo README) trên [github.com/new](https://github.com/new), rồi:

```bash
git remote add origin https://github.com/<ten-tai-khoan>/<ten-repo>.git
git branch -M main
git push -u origin main
```

## Bước 3: Deploy lên Vercel

1. Vào [vercel.com](https://vercel.com) → đăng nhập bằng tài khoản GitHub.
2. **Add New... > Project** → chọn repository vừa push.
3. Ở phần **Environment Variables**, thêm 2 biến lấy từ Bước 1:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Bấm **Deploy**. Sau khoảng 1-2 phút, Vercel sẽ cấp cho bạn một URL dạng `https://ten-du-an.vercel.app`.
5. Mỗi khi bạn `git push` lên nhánh `main`, Vercel sẽ tự động build & deploy lại — không cần thao tác thủ công.

## Sau khi deploy

Trang web ban đầu sẽ **chưa có truyện nào** (đây là nền tảng để cộng đồng tự đăng nội dung, không đi kèm truyện có sẵn để tránh vi phạm bản quyền). Để có nội dung:

1. Vào trang web vừa deploy → **Đăng ký** tài khoản.
2. Vào **Hồ sơ** → tick "Tôi muốn trở thành tác giả" → **Lưu thay đổi**.
3. Vào **Trang tác giả** → **+ Đăng truyện mới** → điền thông tin, tải ảnh bìa (tuỳ chọn) → **Tạo truyện**.
4. Bạn sẽ được chuyển đến form thêm chương đầu tiên — điền tiêu đề và nội dung rồi **Đăng chương**.

## Bước 4: Kích hoạt tài khoản Quản trị (admin) cho hệ thống xu

Chức năng kiếm tiền (xu, khoá chương, sao kê thu nhập) cần một tài khoản **admin** để cộng xu thủ công cho độc giả. Không ai tự phong admin được qua giao diện — bạn phải tự đặt cho tài khoản của mình qua Supabase:

1. Đăng ký tài khoản trên web trước (nếu chưa có).
2. Vào Supabase → **SQL Editor** → chạy lệnh sau (thay `username-cua-ban`):
   ```sql
   update public.profiles set is_admin = true where username = 'username-cua-ban';
   ```
3. Đăng xuất/đăng nhập lại trên web — menu tài khoản sẽ hiện thêm **Quản trị — Cộng xu** và **Quản trị — Doanh thu**.

## Về hệ thống kiếm tiền (xu, khoá chương, chia doanh thu)

- **Tỉ lệ chia**: tác giả nhận 60%, nền tảng (chủ web) nhận 40% trên mỗi lượt mở khoá chương. Tỉ giá quy đổi mặc định 1 xu = 200đ (sửa hằng số `v_coin_value_vnd` trong `supabase/migrations/0002_monetization.sql` nếu muốn đổi, rồi chạy lại phần hàm `unlock_chapter` qua SQL Editor).
- **Nạp xu hiện là thủ công**: hệ thống *chưa* kết nối cổng thanh toán thật (VNPay/Momo/ZaloPay) vì các cổng này yêu cầu tài khoản merchant/doanh nghiệp mà chỉ bạn mới đăng ký được. Quy trình tạm thời: độc giả chuyển khoản ngoài hệ thống → bạn (admin) vào trang **Quản trị — Cộng xu** nhập username + số xu để cộng thủ công. Khi có tài khoản cổng thanh toán, có thể thay bước này bằng tích hợp API thật.
- **Sao kê thu nhập không phải là nộp thuế tự động**: trang **Sao kê thu nhập** (cho tác giả) và **Quản trị — Doanh thu** (cho admin) chỉ hiển thị số liệu doanh thu/thu nhập theo tháng để bạn hoặc tác giả tự khai thuế qua cơ quan thuế thật hoặc nhờ kế toán xử lý. Hệ thống không kết nối với eTax hay nộp thuế thay bạn.

## Cập nhật code sau này

```bash
git add .
git commit -m "Mô tả thay đổi"
git push
```

Vercel sẽ tự động build lại. Nếu bạn thay đổi lược đồ database, tạo thêm file `supabase/migrations/000X_ten-thay-doi.sql` và chạy nó trong SQL Editor của Supabase.
