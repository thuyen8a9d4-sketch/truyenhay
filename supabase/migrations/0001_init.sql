-- ============================================================================
-- Lược đồ CSDL cho nền tảng đọc tiểu thuyết (kiểu Webnovel)
-- Chạy file này trong Supabase Dashboard > SQL Editor (hoặc `supabase db push`)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. BẢNG
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text,
  avatar_url text,
  bio text,
  is_author boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.genres (
  id serial primary key,
  name text not null unique,
  slug text not null unique
);

create table public.novels (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  slug text not null unique,
  cover_url text,
  synopsis text not null default '',
  status text not null default 'ongoing' check (status in ('ongoing', 'completed', 'hiatus')),
  views bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index novels_author_id_idx on public.novels (author_id);

create table public.novel_genres (
  novel_id uuid not null references public.novels (id) on delete cascade,
  genre_id integer not null references public.genres (id) on delete cascade,
  primary key (novel_id, genre_id)
);

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels (id) on delete cascade,
  chapter_number integer not null,
  title text not null,
  content text not null default '',
  views bigint not null default 0,
  created_at timestamptz not null default now(),
  unique (novel_id, chapter_number)
);
create index chapters_novel_id_idx on public.chapters (novel_id);

create table public.library (
  user_id uuid not null references public.profiles (id) on delete cascade,
  novel_id uuid not null references public.novels (id) on delete cascade,
  last_read_chapter_id uuid references public.chapters (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (user_id, novel_id)
);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  novel_id uuid not null references public.novels (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  review text,
  created_at timestamptz not null default now(),
  unique (user_id, novel_id)
);
create index ratings_novel_id_idx on public.ratings (novel_id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
create index comments_chapter_id_idx on public.comments (chapter_id);

-- ---------------------------------------------------------------------------
-- 2. TỰ TẠO PROFILE KHI CÓ NGƯỜI DÙNG ĐĂNG KÝ
-- ---------------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
begin
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'));
  if base_username = '' or base_username is null then
    base_username := 'doc_gia';
  end if;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    base_username || '_' || substr(new.id::text, 1, 6),
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3. HÀM TĂNG LƯỢT XEM (SECURITY DEFINER để không cần mở quyền UPDATE chung)
-- ---------------------------------------------------------------------------

create function public.increment_novel_views(p_novel_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.novels set views = views + 1 where id = p_novel_id;
$$;

create function public.increment_chapter_views(p_chapter_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.chapters set views = views + 1 where id = p_chapter_id;
$$;

grant execute on function public.increment_novel_views(uuid) to anon, authenticated;
grant execute on function public.increment_chapter_views(uuid) to anon, authenticated;

-- Khi có chương mới, cập nhật updated_at của truyện để phục vụ mục "Mới cập nhật"
create function public.touch_novel_on_new_chapter()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.novels set updated_at = now() where id = new.novel_id;
  return new;
end;
$$;

create trigger on_chapter_created
  after insert on public.chapters
  for each row execute function public.touch_novel_on_new_chapter();

-- View tổng hợp thống kê mỗi truyện (đánh giá trung bình, số lượt đánh giá, số chương)
create view public.novel_stats as
select
  n.id as novel_id,
  coalesce(round(avg(r.rating)::numeric, 2), 0) as avg_rating,
  count(distinct r.id) as rating_count,
  count(distinct c.id) as chapter_count
from public.novels n
left join public.ratings r on r.novel_id = n.id
left join public.chapters c on c.novel_id = n.id
group by n.id;

grant select on public.novel_stats to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.genres enable row level security;
alter table public.novels enable row level security;
alter table public.novel_genres enable row level security;
alter table public.chapters enable row level security;
alter table public.library enable row level security;
alter table public.ratings enable row level security;
alter table public.comments enable row level security;

-- profiles: ai cũng đọc được (hiển thị tên tác giả), chỉ chủ tài khoản mới sửa được
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- genres: đọc công khai, quản lý qua SQL editor (không mở insert/update cho client)
create policy "genres_select_all" on public.genres for select using (true);

-- novels: đọc công khai; chỉ tác giả sở hữu mới được ghi, và phải có is_author = true
create policy "novels_select_all" on public.novels for select using (true);
create policy "novels_insert_own" on public.novels for insert
  with check (
    auth.uid() = author_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_author)
  );
create policy "novels_update_own" on public.novels for update
  using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "novels_delete_own" on public.novels for delete using (auth.uid() = author_id);

-- novel_genres: đọc công khai; chỉ tác giả sở hữu truyện mới gán/gỡ thể loại
create policy "novel_genres_select_all" on public.novel_genres for select using (true);
create policy "novel_genres_insert_own" on public.novel_genres for insert
  with check (exists (select 1 from public.novels n where n.id = novel_id and n.author_id = auth.uid()));
create policy "novel_genres_delete_own" on public.novel_genres for delete
  using (exists (select 1 from public.novels n where n.id = novel_id and n.author_id = auth.uid()));

-- chapters: đọc công khai; chỉ tác giả sở hữu truyện mới được ghi
create policy "chapters_select_all" on public.chapters for select using (true);
create policy "chapters_insert_own" on public.chapters for insert
  with check (exists (select 1 from public.novels n where n.id = novel_id and n.author_id = auth.uid()));
create policy "chapters_update_own" on public.chapters for update
  using (exists (select 1 from public.novels n where n.id = novel_id and n.author_id = auth.uid()));
create policy "chapters_delete_own" on public.chapters for delete
  using (exists (select 1 from public.novels n where n.id = novel_id and n.author_id = auth.uid()));

-- library: chỉ chủ sở hữu thấy/sửa thư viện của chính mình
create policy "library_select_own" on public.library for select using (auth.uid() = user_id);
create policy "library_insert_own" on public.library for insert with check (auth.uid() = user_id);
create policy "library_update_own" on public.library for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "library_delete_own" on public.library for delete using (auth.uid() = user_id);

-- ratings: đọc công khai; chỉ chủ mới ghi/sửa/xoá đánh giá của mình
create policy "ratings_select_all" on public.ratings for select using (true);
create policy "ratings_insert_own" on public.ratings for insert with check (auth.uid() = user_id);
create policy "ratings_update_own" on public.ratings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ratings_delete_own" on public.ratings for delete using (auth.uid() = user_id);

-- comments: đọc công khai; chỉ chủ mới ghi/sửa/xoá bình luận của mình
create policy "comments_select_all" on public.comments for select using (true);
create policy "comments_insert_own" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments_update_own" on public.comments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "comments_delete_own" on public.comments for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 5. STORAGE BUCKET CHO ẢNH BÌA TRUYỆN
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

create policy "covers_public_read" on storage.objects for select
  using (bucket_id = 'covers');
create policy "covers_authenticated_insert" on storage.objects for insert
  with check (bucket_id = 'covers' and auth.role() = 'authenticated');
create policy "covers_owner_update" on storage.objects for update
  using (bucket_id = 'covers' and owner = auth.uid());
create policy "covers_owner_delete" on storage.objects for delete
  using (bucket_id = 'covers' and owner = auth.uid());
