-- ============================================================================
-- Phân quyền Reader/Author/Admin có duyệt, duyệt truyện, quy tắc giá xu theo
-- lượt xem, và chức năng rút tiền có điều kiện.
-- Chạy SAU khi đã áp dụng 0001_init.sql và 0002_monetization.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. CHẶN TỰ NÂNG QUYỀN (vá lỗ hổng: profiles_update_own hiện cho phép user
--    tự sửa is_author/is_admin của chính mình qua API trực tiếp)
-- ---------------------------------------------------------------------------

create function public.prevent_role_self_escalation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (new.is_author is distinct from old.is_author or new.is_admin is distinct from old.is_admin)
     and not exists (select 1 from pg_roles where rolname = current_user and rolbypassrls)
  then
    raise exception 'Khong the tu thay doi quyen tai khoan.';
  end if;
  return new;
end;
$$;

create trigger trg_prevent_role_self_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

-- ---------------------------------------------------------------------------
-- 2. ĐƠN XIN LÀM TÁC GIẢ
-- ---------------------------------------------------------------------------

create table public.author_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reject_reason text,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index author_applications_one_pending_idx
  on public.author_applications (user_id) where (status = 'pending');

alter table public.author_applications enable row level security;

create policy "author_applications_select_own" on public.author_applications for select
  using (auth.uid() = user_id);
create policy "author_applications_select_admin" on public.author_applications for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
create policy "author_applications_insert_own" on public.author_applications for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. THÔNG BÁO HỆ THỐNG
-- ---------------------------------------------------------------------------

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_select_own" on public.notifications for select
  using (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4. ĐỒNG Ý ĐIỀU KHOẢN (hợp đồng điện tử, nhân bản giọng nói ở giai đoạn sau)
-- ---------------------------------------------------------------------------

create table public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  consent_type text not null,
  novel_id uuid references public.novels (id) on delete cascade,
  accepted_at timestamptz not null default now()
);

alter table public.user_consents enable row level security;

create policy "user_consents_select_own" on public.user_consents for select
  using (auth.uid() = user_id);
create policy "user_consents_select_admin" on public.user_consents for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
create policy "user_consents_insert_own" on public.user_consents for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 5. DUYỆT TRUYỆN
--    Mặc định 'approved' để không ẩn đột ngột truyện đã đăng từ trước;
--    createNovel() ở tầng ứng dụng sẽ set tường minh 'pending' cho truyện mới.
-- ---------------------------------------------------------------------------

alter table public.novels add column approval_status text not null default 'approved'
  check (approval_status in ('pending', 'approved', 'rejected'));
alter table public.novels add column reject_reason text;
alter table public.novels add column reviewed_by uuid references public.profiles (id);
alter table public.novels add column reviewed_at timestamptz;

drop policy "novels_select_all" on public.novels;
create policy "novels_select_visible" on public.novels for select
  using (
    approval_status = 'approved'
    or author_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy "chapters_select_all" on public.chapters;
create policy "chapters_select_visible" on public.chapters for select
  using (
    exists (
      select 1 from public.novels n
      where n.id = chapters.novel_id
        and (
          n.approval_status = 'approved'
          or n.author_id = auth.uid()
          or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
        )
    )
  );

-- ---------------------------------------------------------------------------
-- 6. GIÁ XU & RÚT TIỀN
--    Tỉ giá mới: 1 xu = 1.000 VNĐ (thay cho 200 VNĐ trước đây).
-- ---------------------------------------------------------------------------

alter table public.wallets add column author_earned_coins integer not null default 0
  check (author_earned_coins >= 0);

create view public.novel_content_stats as
  select c.novel_id, coalesce(sum(length(cc.content)), 0)::bigint as total_chars
  from public.chapters c
  join public.chapter_contents cc on cc.chapter_id = c.id
  group by c.novel_id;

grant select on public.novel_content_stats to anon, authenticated;

-- Giới hạn giá chương VIP theo lượt xem của truyện (chặn ở tầng DB)
create function public.enforce_chapter_price_cap()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_views bigint;
  v_cap integer;
begin
  if new.is_locked and new.price_coins > 0 then
    select views into v_views from public.novels where id = new.novel_id;
    v_cap := case when coalesce(v_views, 0) > 10000 then 100 else 10 end;
    if new.price_coins > v_cap then
      raise exception 'Gia chuong toi da % xu (truyen chua dat 10.000 luot xem).', v_cap;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_enforce_chapter_price_cap
  before insert or update on public.chapters
  for each row execute function public.enforce_chapter_price_cap();

-- Cập nhật unlock_chapter: tỉ giá 1000đ/xu + cộng xu kiếm được cho tác giả
create or replace function public.unlock_chapter(p_chapter_id uuid)
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
  v_author_share_vnd numeric;
  v_platform_share_vnd numeric;
  v_author_share_coins integer;
  v_coin_value_vnd constant numeric := 1000;
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
  v_author_share_coins := round(v_price * 0.6);
  v_author_share_vnd := v_author_share_coins * v_coin_value_vnd;
  v_platform_share_vnd := v_value_vnd - v_author_share_vnd;

  update public.wallets
    set coin_balance = coin_balance - v_price, updated_at = now()
    where user_id = v_user_id;

  update public.wallets
    set author_earned_coins = author_earned_coins + v_author_share_coins, updated_at = now()
    where user_id = v_author_id;

  insert into public.chapter_unlocks
    (user_id, chapter_id, novel_id, coins_spent, value_vnd, author_earning_vnd, platform_earning_vnd)
  values
    (v_user_id, p_chapter_id, v_novel_id, v_price, v_value_vnd, v_author_share_vnd, v_platform_share_vnd);

  select coin_balance into v_balance from public.wallets where user_id = v_user_id;
  return query select true, 'Mo khoa thanh cong.', v_balance;
end;
$$;

-- Bảng yêu cầu rút tiền
create table public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  coins integer not null check (coins > 0),
  amount_vnd numeric not null check (amount_vnd >= 0),
  bank_name text not null,
  bank_account_number text not null,
  bank_account_holder text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'rejected')),
  reject_reason text,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index withdrawal_requests_author_id_idx on public.withdrawal_requests (author_id);

alter table public.withdrawal_requests enable row level security;

create policy "withdrawal_requests_select_own" on public.withdrawal_requests for select
  using (auth.uid() = author_id);
create policy "withdrawal_requests_select_admin" on public.withdrawal_requests for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Tác giả gửi yêu cầu rút tiền (chỉ khi có truyện đạt đủ điều kiện)
create function public.request_withdrawal(
  p_coins integer,
  p_bank_name text,
  p_bank_account_number text,
  p_bank_account_holder text
)
returns table (success boolean, message text)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_balance integer;
  v_eligible boolean;
begin
  if v_user_id is null then
    return query select false, 'Ban can dang nhap.';
    return;
  end if;

  if p_coins is null or p_coins <= 0 then
    return query select false, 'So xu khong hop le.';
    return;
  end if;

  select exists (
    select 1 from public.novels n
    join public.novel_content_stats s on s.novel_id = n.id
    where n.author_id = v_user_id
      and n.approval_status = 'approved'
      and n.views >= 2000
      and s.total_chars >= 20000
  ) into v_eligible;

  if not v_eligible then
    return query select false, 'Chua co truyen dat du 2.000 luot xem va 20.000 chu.';
    return;
  end if;

  select author_earned_coins into v_balance from public.wallets where user_id = v_user_id for update;

  if v_balance is null or v_balance < p_coins then
    return query select false, 'So xu kha dung khong du.';
    return;
  end if;

  update public.wallets
    set author_earned_coins = author_earned_coins - p_coins, updated_at = now()
    where user_id = v_user_id;

  insert into public.withdrawal_requests
    (author_id, coins, amount_vnd, bank_name, bank_account_number, bank_account_holder)
  values
    (v_user_id, p_coins, p_coins * 1000, p_bank_name, p_bank_account_number, p_bank_account_holder);

  return query select true, 'Da gui yeu cau rut tien.';
end;
$$;

grant execute on function public.request_withdrawal(integer, text, text, text) to authenticated;

-- Admin duyệt/từ chối yêu cầu rút tiền (hoàn xu nếu từ chối)
create function public.admin_review_withdrawal(p_request_id uuid, p_decision text, p_reason text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_row public.withdrawal_requests%rowtype;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'Khong co quyen admin';
  end if;

  if p_decision not in ('approved', 'paid', 'rejected') then
    raise exception 'Trang thai khong hop le';
  end if;

  select * into v_row from public.withdrawal_requests where id = p_request_id for update;
  if v_row.id is null then
    raise exception 'Khong tim thay yeu cau';
  end if;

  if p_decision = 'rejected' and v_row.status = 'pending' then
    update public.wallets
      set author_earned_coins = author_earned_coins + v_row.coins, updated_at = now()
      where user_id = v_row.author_id;
  end if;

  update public.withdrawal_requests
    set status = p_decision, reject_reason = p_reason, reviewed_by = auth.uid(), reviewed_at = now()
    where id = p_request_id;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    v_row.author_id,
    'withdrawal_' || p_decision,
    case p_decision
      when 'approved' then 'Yeu cau rut tien da duoc duyet'
      when 'paid' then 'Yeu cau rut tien da duoc thanh toan'
      else 'Yeu cau rut tien bi tu choi'
    end,
    coalesce(p_reason, ''),
    '/author/withdraw'
  );
end;
$$;

grant execute on function public.admin_review_withdrawal(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 7. DUYỆT ĐƠN TÁC GIẢ & DUYỆT TRUYỆN (admin)
-- ---------------------------------------------------------------------------

create function public.admin_review_author_application(p_application_id uuid, p_approve boolean, p_reason text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'Khong co quyen admin';
  end if;

  select user_id into v_user_id from public.author_applications
    where id = p_application_id and status = 'pending';
  if v_user_id is null then
    raise exception 'Khong tim thay don hoac da duoc xu ly';
  end if;

  update public.author_applications
    set status = case when p_approve then 'approved' else 'rejected' end,
        reject_reason = p_reason,
        reviewed_by = auth.uid(),
        reviewed_at = now()
    where id = p_application_id;

  if p_approve then
    update public.profiles set is_author = true where id = v_user_id;
  end if;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    v_user_id,
    'author_application',
    case when p_approve then 'Don xin lam tac gia da duoc duyet' else 'Don xin lam tac gia bi tu choi' end,
    coalesce(p_reason, ''),
    '/author/apply'
  );
end;
$$;

grant execute on function public.admin_review_author_application(uuid, boolean, text) to authenticated;

create function public.admin_review_novel(p_novel_id uuid, p_approve boolean, p_reason text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_author_id uuid;
  v_slug text;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'Khong co quyen admin';
  end if;

  select author_id, slug into v_author_id, v_slug from public.novels where id = p_novel_id;
  if v_author_id is null then
    raise exception 'Khong tim thay truyen';
  end if;

  update public.novels
    set approval_status = case when p_approve then 'approved' else 'rejected' end,
        reject_reason = p_reason,
        reviewed_by = auth.uid(),
        reviewed_at = now()
    where id = p_novel_id;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    v_author_id,
    'novel_review',
    case when p_approve then 'Truyen da duoc duyet' else 'Truyen bi tu choi' end,
    coalesce(p_reason, ''),
    '/novel/' || v_slug
  );
end;
$$;

grant execute on function public.admin_review_novel(uuid, boolean, text) to authenticated;
