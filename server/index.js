import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import multer from "multer";
import dotenv from "dotenv";
import { hasDatabase, query } from "./db.js";
import { initSchema } from "./schema.js";
import { createToken, publicUser, requireAdmin, requireAuth } from "./auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(__dirname, ".env"), quiet: true });
dotenv.config({ quiet: true });

const app = express();
const host = "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const uploadsDir = path.join(rootDir, "uploads");
const adminEmail = "adilhan.bekentaev@mail.ru";
const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 1024 * 1024 * 600 },
  fileFilter(_req, file, cb) {
    const allowed = file.mimetype.startsWith("video/") || file.mimetype.startsWith("audio/");
    cb(allowed ? null : new Error("Only video/audio files are allowed"), allowed);
  }
});

await fs.mkdir(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json({ limit: "12mb" }));
app.use(express.static(rootDir));
app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, app: "DANGO", database: hasDatabase ? "configured" : "missing" });
});

app.post("/api/auth/register", async (req, res) => {
  const { login, email, password } = req.body || {};

  if (!login || !email || !password || password.length < 6) {
    return res.status(400).json({ error: "login_email_password_required" });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const role = normalizedEmail === adminEmail ? "admin" : "user";
    const result = await query(
      `insert into users (login, email, password_hash, role)
       values ($1, $2, $3, $4)
       returning id, login, email, role, avatar, banner, created_at`,
      [login.trim(), normalizedEmail, passwordHash, role]
    );
    const user = result.rows[0];
    return res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "user_already_exists" });
    }
    return res.status(500).json({ error: "register_failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "email_password_required" });
  }

  const result = await query(
    "select id, login, email, role, password_hash, avatar, banner, created_at from users where email = $1",
    [email.trim().toLowerCase()]
  );
  let user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  if (user.email === adminEmail && user.role !== "admin") {
    const promoted = await query(
      "update users set role = 'admin' where id = $1 returning id, login, email, role, password_hash, avatar, banner, created_at",
      [user.id]
    );
    user = promoted.rows[0];
  }

  return res.json({ token: createToken(user), user: publicUser(user) });
});

app.get("/api/profile", requireAuth, async (req, res) => {
  const [likes, progress] = await Promise.all([
    query("select anime_id, anime_name, anime_image from likes where user_id = $1 order by created_at desc", [req.user.id]),
    query(
      `select anime_id, anime_name, anime_image, season, episode, progress, updated_at
       from progress
       where user_id = $1
       order by updated_at desc
       limit 6`,
      [req.user.id]
    )
  ]);

  res.json({
    user: publicUser(req.user),
    liked: likes.rows,
    continueWatching: progress.rows
  });
});

app.patch("/api/profile", requireAuth, async (req, res) => {
  const { avatar, banner } = req.body || {};
  const result = await query(
    `update users
     set avatar = coalesce($2, avatar),
         banner = coalesce($3, banner)
     where id = $1
     returning id, login, email, role, avatar, banner, created_at`,
    [req.user.id, avatar ?? null, banner ?? null]
  );
  res.json({ user: publicUser(result.rows[0]) });
});

app.post("/api/likes/toggle", requireAuth, async (req, res) => {
  const { animeId, animeName, animeImage } = req.body || {};

  if (!animeId || !animeName) {
    return res.status(400).json({ error: "anime_required" });
  }

  const existing = await query(
    "select 1 from likes where user_id = $1 and anime_id = $2",
    [req.user.id, animeId]
  );

  if (existing.rows[0]) {
    await query("delete from likes where user_id = $1 and anime_id = $2", [req.user.id, animeId]);
    return res.json({ liked: false });
  }

  await query(
    `insert into likes (user_id, anime_id, anime_name, anime_image)
     values ($1, $2, $3, $4)
     on conflict (user_id, anime_id) do nothing`,
    [req.user.id, animeId, animeName, animeImage || ""]
  );

  return res.json({ liked: true });
});

app.post("/api/progress", requireAuth, async (req, res) => {
  const { animeId, animeName, animeImage, season, episode, progress } = req.body || {};

  if (!animeId || !animeName || !season || !episode) {
    return res.status(400).json({ error: "progress_required" });
  }

  const result = await query(
    `insert into progress (user_id, anime_id, anime_name, anime_image, season, episode, progress)
     values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (user_id, anime_id, season, episode)
     do update set progress = excluded.progress, updated_at = now()
     returning anime_id, anime_name, anime_image, season, episode, progress, updated_at`,
    [req.user.id, animeId, animeName, animeImage || "", season, episode, Number(progress || 0)]
  );

  res.json({ progress: result.rows[0] });
});

app.get("/api/comments/:animeId/:season/:episode", async (req, res) => {
  const { animeId, season, episode } = req.params;
  const result = await query(
    `select comments.id, comments.text, comments.created_at,
            users.login as author, users.avatar
     from comments
     left join users on users.id = comments.user_id
     where anime_id = $1 and season = $2 and episode = $3
     order by comments.created_at desc
     limit 80`,
    [animeId, season, episode]
  );
  res.json({ comments: result.rows });
});

app.post("/api/comments", requireAuth, async (req, res) => {
  const { animeId, animeName, season, episode, text } = req.body || {};

  if (!animeId || !animeName || !season || !episode || !text?.trim()) {
    return res.status(400).json({ error: "comment_required" });
  }

  const result = await query(
    `insert into comments (user_id, anime_id, anime_name, season, episode, text)
     values ($1, $2, $3, $4, $5, $6)
     returning id, text, created_at`,
    [req.user.id, animeId, animeName, season, episode, text.trim()]
  );

  res.status(201).json({
    comment: {
      ...result.rows[0],
      author: req.user.login,
      avatar: req.user.avatar || ""
    }
  });
});

app.get("/api/media/:animeId/:season/:episode", async (req, res) => {
  const { animeId, season, episode } = req.params;
  const result = await query(
    `select anime_id, anime_name, season, episode, original_name, file_url, mime_type, created_at
     from episode_media
     where anime_id = $1 and season = $2 and episode = $3`,
    [animeId, season, episode]
  );
  res.json({ media: result.rows[0] || null });
});

app.post("/api/admin/media", requireAuth, requireAdmin, upload.single("media"), async (req, res) => {
  const { animeId, animeName, season, episode } = req.body || {};
  if (!req.file || !animeId || !animeName || !season || !episode) {
    return res.status(400).json({ error: "media_upload_required" });
  }

  const safeName = `${Date.now()}-${req.file.originalname.replace(/[^a-zа-я0-9._-]+/gi, "_")}`;
  const from = path.join(uploadsDir, req.file.filename);
  const to = path.join(uploadsDir, safeName);
  await fs.rename(from, to);

  const fileUrl = `/uploads/${safeName}`;
  const result = await query(
    `insert into episode_media (anime_id, anime_name, season, episode, original_name, file_url, mime_type, uploaded_by)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (anime_id, season, episode)
     do update set original_name = excluded.original_name,
                   file_url = excluded.file_url,
                   mime_type = excluded.mime_type,
                   uploaded_by = excluded.uploaded_by,
                   created_at = now()
     returning anime_id, anime_name, season, episode, original_name, file_url, mime_type, created_at`,
    [animeId, animeName, season, episode, req.file.originalname, fileUrl, req.file.mimetype, req.user.id]
  );

  res.status(201).json({ media: result.rows[0] });
});

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(rootDir, "index.html"));
});

try {
  await initSchema();
} catch (error) {
  console.error("DANGO database connection failed.");
  console.error("Check DATABASE_URL. On Railway, attach the Postgres service to this web service or add DATABASE_URL from Railway Postgres variables.");
  console.error(error.message);
  process.exit(1);
}

app.listen(port, host, () => {
  console.log(`DANGO server listening on ${host}:${port}`);
  if (!hasDatabase) {
    console.log("DANGO is running without DATABASE_URL. Static pages work; account features need Railway Postgres variables.");
  }
});
