-- ============================================================================
-- Hệ thống xu, khóa chương trả phí, chia doanh thu tác giả/nền tảng (60/40)
-- Chạy SAU khi đã áp dụng 0001_init.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. CỘT MỚI
-- ---------------------------------------------------------------------------

alter table public.profiles add column is_admin boolean not null default false;

alter table public.chapters add column is_locked boolean not null default false;
alter table public.chapters add column price_coins integer not null default 0 check (price_coins >= 0);

-- ---------------------------------------------------------------------------
-- 2. VÍ XU
-- ---------------------------------------------------------------------------

create table public.wallets (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  coin_balance integer not null default 0 check (coin_balance >= 0),
  updated_at timestamptz not null default now()
);

alter table public.wallets enable row level security;

create policy "wallets_select_own" on public.wallets for select using (auth.uid() = user_id);

-- Tự tạo ví (0 xu) khi có profile mới
create function public.handle_new_profile_wallet()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.wallets (user_id, coin_balance) values (new.id, 0);
  return new;
end;
$$;

create trigger on_profile_created_wallet
  after insert on public.profiles
  for each row execute function public.handle_new_profile_wallet();

-- Tạo ví cho các tài khoản đã có sẵn trước khi chạy migration này
insert into public.wallets (user_id, coin_balance)
select id, 0 from public.profiles
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------------
-- 3. LỊCH SỬ NẠP XU (do admin cộng thủ công cho tới khi có cổng thanh toán thật)
-- ---------------------------------------------------------------------------

create table public.coin_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  coins integer not null check (coins > 0),
  amount_vnd numeric not null check (amount_vnd >= 0),
  note text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.coin_purchases enable row level security;

create policy "coin_purchases_select_own" on public.coin_purchases for select
  using (auth.uid() = user_id);
create policy "coin_purchases_select_admin" on public.coin_purchases for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ---------------------------------------------------------------------------
-- 4. LỊCH SỬ MỞ KHOÁ CHƯƠNG (nguồn dữ liệu cho sao kê thu nhập)
-- ---------------------------------------------------------------------------

create table public.chapter_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  novel_id uuid not null references public.novels (id) on delete cascade,
  coins_spent integer not null,
  value_vnd numeric not null,
  author_earning_vnd numeric not null,
  platform_earning_vnd numeric not null,
  created_at timestamptz not null default now(),
  unique (user_id, chapter_id)
);
create index chapter_unlocks_novel_id_idx on public.chapter_unlocks (novel_id);
create index chapter_unlocks_created_at_idx on public.chapter_unlocks (created_at);

alter table public.chapter_unlocks enable row level security;

create policy "chapter_unlocks_select_own_purchase" on public.chapter_unlocks for select
  using (auth.uid() = user_id);
create policy "chapter_unlocks_select_own_earnings" on public.chapter_unlocks for select
  using (exists (select 1 from public.novels n where n.id = novel_id and n.author_id = auth.uid()));
create policy "chapter_unlocks_select_admin" on public.chapter_unlocks for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ---------------------------------------------------------------------------
-- 5. TÁCH NỘI DUNG CHƯƠNG RA BẢNG RIÊNG (để chặn đọc lén qua API khi chưa mở khoá)
-- ---------------------------------------------------------------------------

create table public.chapter_contents (
  chapter_id uuid primary key references public.chapters (id) on delete cascade,
  content text not null default ''
);

insert into public.chapter_contents (chapter_id, content)
select id, content from public.chapters;

alter table public.chapters drop column content;

alter table public.chapter_contents enable row level security;

create policy "chapter_contents_select_accessible" on public.chapter_contents for select
  using (
    exists (
      select 1 from public.chapters c
      where c.id = chapter_contents.chapter_id
        and (
          not c.is_locked
          or c.price_coins = 0
          or exists (
            select 1 from public.chapter_unlocks u
            where u.chapter_id = c.id and u.user_id = auth.uid()
          )
          or exists (
            select 1 from public.novels n
            where n.id = c.novel_id and n.author_id = auth.uid()
          )
        )
    )
  );

create policy "chapter_contents_insert_own" on public.chapter_contents for insert
  with check (
    exists (
      select 1 from public.chapters c
      join public.novels n on n.id = c.novel_id
      where c.id = chapter_contents.chapter_id and n.author_id = auth.uid()
    )
  );

create policy "chapter_contents_update_own" on public.chapter_contents for update
  using (
    exists (
      select 1 from public.chapters c
      join public.novels n on n.id = c.novel_id
      where c.id = chapter_contents.chapter_id and n.author_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 6. HÀM MỞ KHOÁ CHƯƠNG (trừ xu độc giả, ghi nhận chia 60% tác giả / 40% nền tảng)
--    Quy đổi: 1 xu = 200 VNĐ (đổi hằng số v_coin_value_vnd nếu muốn thay đổi tỉ giá)
-- ---------------------------------------------------------------------------

create function public.unlock_chapter(p_chapter_id uuid)
returns table (success boolean, message text, new_balance integer)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_price integer;
  v_novel_id uuid;
  v_author_id uuid;
  v_balance integer;
  v_value_vnd numeric;
  v_author_share numeric;
  v_platform_share numeric;
  v_coin_value_vnd constant numeric := 200;
begin
  if v_user_id is null then
    return query select false, 'Ban can dang nhap.', 0;
    return;
  end if;

  select c.price_coins, c.novel_id into v_price, v_novel_id
  from public.chapters c where c.id = p_chapter_id;

  if v_novel_id is null then
    return query select false, 'Khong tim thay chuong.', 0;
    return;
  end if;

  if v_price = 0 then
    select coin_balance into v_balance from public.wallets where user_id = v_user_id;
    return query select true, 'Chuong mien phi.', coalesce(v_balance, 0);
    return;
  end if;

  if exists (
    select 1 from public.chapter_unlocks
    where user_id = v_user_id and chapter_id = p_chapter_id
  ) then
    select coin_balance into v_balance from public.wallets where user_id = v_user_id;
    return query select true, 'Da mo khoa truoc do.', coalesce(v_balance, 0);
    return;
  end if;

  select author_id into v_author_id from public.novels where id = v_novel_id;

  select coin_balance into v_balance from public.wallets where user_id = v_user_id for update;

  if v_balance is null or v_balance < v_price then
    return query select false, 'So du xu khong du.', coalesce(v_balance, 0);
    return;
  end if;

  v_value_vnd := v_price * v_coin_value_vnd;
  v_author_share := round(v_value_vnd * 0.6);
  v_platform_share := v_value_vnd - v_author_share;

  update public.wallets
    set coin_balance = coin_balance - v_price, updated_at = now()
    where user_id = v_user_id;

  insert into public.chapter_unlocks
    (user_id, chapter_id, novel_id, coins_spent, value_vnd, author_earning_vnd, platform_earning_vnd)
  values
    (v_user_id, p_chapter_id, v_novel_id, v_price, v_value_vnd, v_author_share, v_platform_share);

  select coin_balance into v_balance from public.wallets where user_id = v_user_id;
  return query select true, 'Mo khoa thanh cong.', v_balance;
end;
$$;

grant execute on function public.unlock_chapter(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 7. HÀM ADMIN CỘNG XU THỦ CÔNG (sau khi xác nhận chuyển khoản ngoài hệ thống)
-- ---------------------------------------------------------------------------

create function public.admin_credit_coins(p_user_id uuid, p_coins integer, p_amount_vnd numeric, p_note text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'Khong co quyen admin';
  end if;

  insert into public.wallets (user_id, coin_balance)
  values (p_user_id, p_coins)
  on conflict (user_id) do update
    set coin_balance = public.wallets.coin_balance + p_coins, updated_at = now();

  insert into public.coin_purchases (user_id, coins, amount_vnd, note, created_by)
  values (p_user_id, p_coins, p_amount_vnd, p_note, auth.uid());
end;
$$;

grant execute on function public.admin_credit_coins(uuid, integer, numeric, text) to authenticated;
