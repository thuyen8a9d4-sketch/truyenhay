-- Dữ liệu thể loại mặc định. Chạy sau khi đã áp dụng migrations/0001_init.sql.
-- (Không seed sẵn truyện/chương mẫu vì cần gắn với một tài khoản tác giả thật —
-- sau khi deploy, hãy đăng ký tài khoản, bật chế độ tác giả trong Hồ sơ, rồi đăng truyện đầu tiên.)

insert into public.genres (name, slug) values
  ('Ngôn tình', 'ngon-tinh'),
  ('Kiếm hiệp', 'kiem-hiep'),
  ('Huyền huyễn', 'huyen-huyen'),
  ('Đô thị', 'do-thi'),
  ('Trinh thám', 'trinh-tham'),
  ('Khoa huyễn', 'khoa-huyen'),
  ('Dị giới', 'di-gioi'),
  ('Hệ thống', 'he-thong'),
  ('Xuyên không', 'xuyen-khong'),
  ('Trọng sinh', 'trong-sinh'),
  ('Quân sự', 'quan-su'),
  ('Lịch sử', 'lich-su'),
  ('Kinh dị', 'kinh-di'),
  ('Hài hước', 'hai-huoc'),
  ('Thanh xuân vườn trường', 'thanh-xuan-vuon-truong')
on conflict (slug) do nothing;
