-- ============================================================================
-- Thống kê cho bảng điều khiển tác giả/admin: số lượt sưu tầm mỗi truyện
-- và lượt xem theo ngày (phục vụ biểu đồ 7 ngày, so sánh hôm nay/hôm qua).
-- Chạy SAU khi đã áp dụng 0003_roles_pricing_withdrawals.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. SỐ NGƯỜI SƯU TẦM (thêm vào thư viện) MỖI TRUYỆN
--    Bảng library có RLS chỉ cho xem dòng của chính mình, nên dùng view
--    (thuộc sở hữu postgres, vượt RLS — cùng cơ chế với view novel_stats).
-- ---------------------------------------------------------------------------

create view public.novel_library_stats as
select novel_id, count(*)::bigint as library_count
from public.library
group by novel_id;

grant select on public.novel_library_stats to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. LƯỢT XEM THEO NGÀY
-- ---------------------------------------------------------------------------

create table public.novel_view_daily (
  novel_id uuid not null references public.novels (id) on delete cascade,
  day date not null,
  views integer not null default 0,
  primary key (novel_id, day)
);

alter table public.novel_view_daily enable row level security;

create policy "novel_view_daily_select_all" on public.novel_view_daily for select using (true);
-- Không có policy insert/update cho client — chỉ ghi qua 2 hàm SECURITY DEFINER dưới đây.

-- ---------------------------------------------------------------------------
-- 3. CẬP NHẬT HÀM ĐẾM LƯỢT XEM: ghi thêm vào novel_view_daily
--    Giữ nguyên hành vi cũ với novels.views / chapters.views để không ảnh
--    hưởng ngưỡng giá xu và điều kiện rút tiền.
-- ---------------------------------------------------------------------------

create or replace function public.increment_novel_views(p_novel_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.novels set views = views + 1 where id = p_novel_id;

  insert into public.novel_view_daily (novel_id, day, views)
  values (p_novel_id, current_date, 1)
  on conflict (novel_id, day) do update
    set views = public.novel_view_daily.views + 1;
$$;

create or replace function public.increment_chapter_views(p_chapter_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.chapters set views = views + 1 where id = p_chapter_id;

  insert into public.novel_view_daily (novel_id, day, views)
  select c.novel_id, current_date, 1
  from public.chapters c
  where c.id = p_chapter_id
  on conflict (novel_id, day) do update
    set views = public.novel_view_daily.views + 1;
$$;
