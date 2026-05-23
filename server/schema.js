import path from "node:path";
import { fileURLToPath } from "node:url";
import { hasDatabase, query, pool } from "./db.js";

export async function initSchema() {
  if (!hasDatabase) {
    console.warn("DATABASE_URL is not set. DANGO will start in static-only mode.");
    return;
  }

  await query(`
    create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      login text not null unique,
      email text not null unique,
      password_hash text not null,
      role text not null default 'user',
      avatar text,
      banner text,
      created_at timestamptz not null default now()
    );

    alter table users add column if not exists role text not null default 'user';

    create table if not exists likes (
      user_id uuid not null references users(id) on delete cascade,
      anime_id integer not null,
      anime_name text not null,
      anime_image text,
      created_at timestamptz not null default now(),
      primary key (user_id, anime_id)
    );

    create table if not exists progress (
      user_id uuid not null references users(id) on delete cascade,
      anime_id integer not null,
      anime_name text not null,
      anime_image text,
      season integer not null,
      episode integer not null,
      progress integer not null default 0,
      updated_at timestamptz not null default now(),
      primary key (user_id, anime_id, season, episode)
    );

    create table if not exists comments (
      id bigserial primary key,
      user_id uuid references users(id) on delete set null,
      anime_id integer not null,
      anime_name text not null,
      season integer not null,
      episode integer not null,
      text text not null,
      created_at timestamptz not null default now()
    );

    create index if not exists comments_episode_idx
      on comments (anime_id, season, episode, created_at desc);

    create index if not exists progress_user_updated_idx
      on progress (user_id, updated_at desc);

    create table if not exists episode_media (
      id bigserial primary key,
      anime_id integer not null,
      anime_name text not null,
      season integer not null,
      episode integer not null,
      original_name text not null,
      file_url text not null,
      mime_type text not null,
      uploaded_by uuid references users(id) on delete set null,
      created_at timestamptz not null default now(),
      unique (anime_id, season, episode)
    );

    update users
    set role = 'admin'
    where lower(email) in ('adilhan.bekentaev@mail.ru', 'adimirten@gmail.com');

    alter table users enable row level security;
    alter table likes enable row level security;
    alter table progress enable row level security;
    alter table comments enable row level security;
    alter table episode_media enable row level security;
  `);
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isCli) {
  try {
    await initSchema();
    await pool?.end();
    console.log("DANGO database schema is ready.");
  } catch (error) {
    console.error("DANGO database connection failed.");
    console.error("Check DATABASE_URL. On Railway, attach the Postgres service to this web service or add DATABASE_URL from Railway Postgres variables.");
    console.error(error.message);
    process.exit(1);
  }
}
