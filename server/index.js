import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import multer from "multer";
import nodemailer from "nodemailer";
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
const adminEmails = new Set([
  "adilhan.bekentaev@mail.ru",
  "adimirten@gmail.com"
]);
const passwordResetCodes = new Map();
const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 1024 * 1024 * 600 },
  fileFilter(_req, file, cb) {
    const allowed = file.mimetype.startsWith("video/") || file.mimetype.startsWith("audio/");
    cb(allowed ? null : new Error("Only video/audio files are allowed"), allowed);
  }
});

await fs.mkdir(uploadsDir, { recursive: true });

function makeMailer() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

function hashResetCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function resetKey(email, login) {
  return `${email.trim().toLowerCase()}:${login.trim().toLowerCase()}`;
}

function publicBaseUrl(req) {
  return process.env.PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
}

function googleCallbackUrl(req) {
  return process.env.GOOGLE_CALLBACK_URL || `${publicBaseUrl(req)}/api/auth/google/callback`;
}

function makeGoogleLogin(email, name) {
  const localPart = email.split("@")[0] || name || "dango";
  return localPart
    .toLowerCase()
    .replace(/[^a-z0-9а-я_-]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24) || `dango_${Date.now()}`;
}

async function createUniqueLogin(baseLogin) {
  let login = baseLogin;
  for (let index = 0; index < 20; index += 1) {
    const existing = await query("select 1 from users where lower(login) = $1", [login.toLowerCase()]);
    if (!existing.rows[0]) return login;
    login = `${baseLogin}_${index + 1}`;
  }
  return `${baseLogin}_${Date.now()}`;
}

async function sendResetCode(email, login, code) {
  const mailer = makeMailer();
  if (!mailer) {
    console.log(`DANGO password reset code for ${email} / ${login}: ${code}`);
    return "console";
  }

  await mailer.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "DANGO: код смены пароля",
    text: `Ваш код смены пароля DANGO: ${code}. Код действует 10 минут.`,
    html: `<p>Ваш код смены пароля DANGO:</p><h2>${code}</h2><p>Код действует 10 минут.</p>`
  });
  return "email";
}

app.use(cors());
app.use(express.json({ limit: "12mb" }));
app.get("/script.js", async (_req, res) => {
  const [mainScript, authFixes] = await Promise.all([
    fs.readFile(path.join(rootDir, "script.js"), "utf8"),
    fs.readFile(path.join(rootDir, "auth-fixes.js"), "utf8").catch(() => "")
  ]);
  res.type("application/javascript").send(`${mainScript}\n\n${authFixes}`);
});
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
    const role = adminEmails.has(normalizedEmail) ? "admin" : "user";
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

  if (!user) {
    return res.status(404).json({ error: "user_not_found" });
  }

  if (!(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: "wrong_password" });
  }

  if (adminEmails.has(user.email) && user.role !== "admin") {
    const promoted = await query(
      "update users set role = 'admin' where id = $1 returning id, login, email, role, password_hash, avatar, banner, created_at",
      [user.id]
    );
    user = promoted.rows[0];
  }

  return res.json({ token: createToken(user), user: publicUser(user) });
});

app.get("/api/auth/google", (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).send("Google Auth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET on Railway.");
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: googleCallbackUrl(req),
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account"
  });

  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

app.get("/api/auth/google/callback", async (req, res) => {
  const { code, error } = req.query || {};

  if (error) {
    return res.redirect(`/?auth_error=${encodeURIComponent(String(error))}`);
  }

  if (!code || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect("/?auth_error=google_not_configured");
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: String(code),
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: googleCallbackUrl(req),
        grant_type: "authorization_code"
      })
    });
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Google token exchange failed:", tokenData);
      return res.redirect("/?auth_error=google_token_failed");
    }

    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const profile = await profileResponse.json();

    if (!profileResponse.ok || !profile.email) {
      console.error("Google profile fetch failed:", profile);
      return res.redirect("/?auth_error=google_profile_failed");
    }

    const normalizedEmail = profile.email.trim().toLowerCase();
    const role = adminEmails.has(normalizedEmail) ? "admin" : "user";
    const existing = await query(
      "select id, login, email, role, avatar, banner, created_at from users where lower(email) = $1",
      [normalizedEmail]
    );
    let user = existing.rows[0];

    if (user) {
      const updated = await query(
        `update users
         set role = $2,
             avatar = coalesce(nullif(avatar, ''), $3)
         where id = $1
         returning id, login, email, role, avatar, banner, created_at`,
        [user.id, role, profile.picture || ""]
      );
      user = updated.rows[0];
    } else {
      const login = await createUniqueLogin(makeGoogleLogin(normalizedEmail, profile.name));
      const passwordHash = `google:${profile.sub || crypto.randomUUID()}`;
      const created = await query(
        `insert into users (login, email, password_hash, role, avatar)
         values ($1, $2, $3, $4, $5)
         returning id, login, email, role, avatar, banner, created_at`,
        [login, normalizedEmail, passwordHash, role, profile.picture || ""]
      );
      user = created.rows[0];
    }

    const token = createToken(user);
    return res.redirect(`/?auth_token=${encodeURIComponent(token)}`);
  } catch (authError) {
    console.error("Google auth failed:", authError);
    return res.redirect("/?auth_error=google_auth_failed");
  }
});

app.post("/api/auth/request-password-reset", async (req, res) => {
  const { login, email } = req.body || {};

  if (!login || !email) {
    return res.status(400).json({ error: "login_email_required" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedLogin = login.trim().toLowerCase();
  const result = await query(
    "select id, login, email from users where lower(email) = $1 and lower(login) = $2",
    [normalizedEmail, normalizedLogin]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ error: "reset_identity_not_found" });
  }

  const code = String(crypto.randomInt(100000, 1000000));
  passwordResetCodes.set(resetKey(normalizedEmail, normalizedLogin), {
    codeHash: hashResetCode(code),
    expiresAt: Date.now() + 10 * 60 * 1000
  });

  try {
    const delivery = await sendResetCode(normalizedEmail, normalizedLogin, code);
    return res.json({ ok: true, delivery });
  } catch (error) {
    console.error("Password reset email failed:", error.message);
    passwordResetCodes.delete(resetKey(normalizedEmail, normalizedLogin));
    return res.status(500).json({ error: "email_send_failed" });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { login, email, password, code } = req.body || {};

  if (!login || !email || !password || password.length < 6 || !code) {
    return res.status(400).json({ error: "login_email_password_code_required" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedLogin = login.trim().toLowerCase();
  const key = resetKey(normalizedEmail, normalizedLogin);
  const savedCode = passwordResetCodes.get(key);

  if (!savedCode || savedCode.expiresAt < Date.now()) {
    passwordResetCodes.delete(key);
    return res.status(400).json({ error: "reset_code_expired" });
  }

  if (savedCode.codeHash !== hashResetCode(String(code).trim())) {
    return res.status(400).json({ error: "reset_code_invalid" });
  }

  const result = await query(
    "select id, login, email, role, avatar, banner, created_at from users where lower(email) = $1 and lower(login) = $2",
    [normalizedEmail, normalizedLogin]
  );
  let user = result.rows[0];

  if (!user) {
    return res.status(404).json({ error: "reset_identity_not_found" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const role = adminEmails.has(normalizedEmail) ? "admin" : user.role;
  const updated = await query(
    `update users
     set password_hash = $2,
         role = $3
     where id = $1
     returning id, login, email, role, avatar, banner, created_at`,
    [user.id, passwordHash, role]
  );
  user = updated.rows[0];
  passwordResetCodes.delete(key);

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
