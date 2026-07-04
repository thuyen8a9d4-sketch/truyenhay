# Hướng dẫn triển khai miễn phí (Supabase + GitHub + Vercel)

Làm theo đúng thứ tự 3 bước dưới đây. Toàn bộ đều dùng gói miễn phí.

## Bước 1: Tạo project Supabase (database + đăng nhập + lưu ảnh)

1. Vào [supabase.com](https://supabase.com) → đăng ký/đăng nhập → **New project**.
2. Đặt tên project, đặt mật khẩu database (lưu lại), chọn region gần Việt Nam (Singapore).
3. Đợi project khởi tạo xong (khoảng 1-2 phút).
4. Vào **SQL Editor** (menu bên trái) → **New query**.
5. Mở file [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) trong dự án, copy toàn bộ nội dung, dán vào SQL Editor, bấm **Run**.
6. Làm tương tự với file [`supabase/seed.sql`](./supabase/seed.sql) để tạo sẵn danh sách thể loại.
7. Vào **Project Settings > API**, lấy 2 giá trị:
   - **Project URL** → dùng cho `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → dùng cho `NEXT_PUBLIC_SUPABASE_ANON_KEY`
8. (Tuỳ chọn) Vào **Authentication > Sign In / Providers**, có thể tắt "Confirm email" nếu muốn người dùng đăng nhập ngay sau khi đăng ký mà không cần xác nhận email — hữu ích khi mới demo dự án.

## Bước 2: Đưa code lên GitHub

Trong thư mục dự án:

```bash
git init
git add .
git commit -m "Khởi tạo TruyệnHay"
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

## Cập nhật code sau này

```bash
git add .
git commit -m "Mô tả thay đổi"
git push
```

Vercel sẽ tự động build lại. Nếu bạn thay đổi lược đồ database, tạo thêm file `supabase/migrations/000X_ten-thay-doi.sql` và chạy nó trong SQL Editor của Supabase.
