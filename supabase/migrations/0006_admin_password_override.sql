-- Admin password override (post-reset SoT) + one-shot reset tokens.
-- Solo service role: RLS on, sin policies públicas.

create table if not exists public.admin_auth_settings (
  id int primary key default 1 check (id = 1),
  password_hash text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_password_reset_tokens_created_at_idx
  on public.admin_password_reset_tokens (created_at desc);

alter table public.admin_auth_settings enable row level security;
alter table public.admin_password_reset_tokens enable row level security;

-- Sin policies: acceso solo con service role (bypasses RLS).
