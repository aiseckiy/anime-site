function dangoAuthErrorText(code, mode) {
  const messages = {
    user_not_found: "Аккаунт не найден. Переключил на регистрацию: придумайте логин и создайте профиль.",
    wrong_password: "Неверный пароль. Проверьте раскладку и попробуйте снова.",
    invalid_credentials: "Неверная почта или пароль. Если аккаунта еще нет, нажмите Регистрация.",
    user_already_exists: "Аккаунт с этой почтой уже есть. Переключил на вход: введите его пароль.",
    email_password_required: "Введите почту и пароль.",
    login_email_required: "Введите логин и почту, чтобы получить код подтверждения.",
    login_email_password_required: "Для регистрации нужны логин, почта и пароль минимум 6 символов.",
    login_email_password_code_required: "Введите логин, почту, новый пароль и код из письма.",
    reset_identity_not_found: "Не нашел аккаунт с такой почтой и логином. Проверьте логин или зарегистрируйте новый профиль.",
    reset_code_expired: "Код истек. Нажмите 'Получить код' еще раз.",
    reset_code_invalid: "Код неверный. Проверьте письмо и введите 6 цифр.",
    email_send_failed: "Не получилось отправить письмо. Проверьте SMTP-настройки на Railway.",
    register_failed: "Регистрация не прошла. Попробуйте еще раз.",
    api_error: "Сервер не принял запрос. Попробуйте еще раз."
  };
  return messages[code] || `${mode === "create" ? "Ошибка регистрации" : "Ошибка входа"}: ${code}`;
}

function dangoCurrentAuthMode(mode) {
  if (mode) return mode;
  if (typeof state !== "undefined" && state?.authMode) return state.authMode;
  if (typeof authMode !== "undefined") return authMode;
  return "login";
}

async function dangoFinishGoogleRedirect() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("auth_token");
  const error = params.get("auth_error");

  if (token) {
    localStorage.setItem("dangoToken", token);
    window.history.replaceState({}, document.title, window.location.pathname);
    try {
      const profile = await dangoAuthRequest("/api/profile");
      await dangoApplyAuthProfile({ token, user: profile.user }, "google");
    } catch {
      document.querySelector("#accountHint").textContent = "Google-вход прошел, но профиль не загрузился. Обновите страницу.";
    }
  } else if (error) {
    window.history.replaceState({}, document.title, window.location.pathname);
    document.querySelector("#accountHint").textContent = `Google Auth не прошел: ${error}`;
  }
}

async function dangoAuthRequest(path, options = {}) {
  if (typeof apiRequest === "function") return apiRequest(path, options);
  if (typeof api === "function") return api(path, options);

  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  const savedToken = localStorage.getItem("dangoToken");
  if (savedToken) headers.Authorization = `Bearer ${savedToken}`;

  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "api_error");
  return data;
}

async function dangoApplyAuthProfile(data, mode) {
  localStorage.setItem("dangoToken", data.token);
  localStorage.setItem("dangoBackendUser", JSON.stringify(data.user));

  if (typeof applyBackendProfile === "function") {
    applyBackendProfile({ user: data.user, liked: [], continueWatching: [] });
  } else if (typeof state !== "undefined") {
    state.user = data.user;
  }

  document.querySelector("#accountTitle").textContent = mode === "reset"
    ? "Пароль изменен"
    : mode === "google" ? "Google-профиль активен"
    : data.user.isAdmin ? "Админ-профиль активен" : "Профиль сохранен";
  document.querySelector("#accountHint").textContent = `${data.user.login} • ${data.user.email}`;
  localStorage.setItem("dangoSession", data.user.login);

  if (typeof loadBackendProfile === "function") await loadBackendProfile();
  if (typeof loadProfile === "function") await loadProfile();
  if (typeof renderAccount === "function") renderAccount();
}

async function createAccount(mode) {
  mode = dangoCurrentAuthMode(mode);
  const login = document.querySelector("#loginInput").value.trim();
  const email = document.querySelector("#emailInput").value.trim();
  const password = document.querySelector("#passwordInput").value;
  const code = document.querySelector("#resetCodeInput")?.value.trim() || "";
  const path = mode === "create"
    ? "/api/auth/register"
    : mode === "reset"
      ? "/api/auth/reset-password"
      : "/api/auth/login";

  if ((mode === "create" || mode === "reset") && !login) {
    document.querySelector("#accountHint").textContent = mode === "reset"
      ? "Для смены пароля нужен ваш логин."
      : "Для регистрации нужен логин.";
    return;
  }

  try {
    const payload = mode === "create"
      ? { login, email, password }
      : mode === "reset"
        ? { login, email, password, code }
        : { email, password };
    const data = await dangoAuthRequest(path, { method: "POST", body: JSON.stringify(payload) });
    await dangoApplyAuthProfile(data, mode);
  } catch (error) {
    document.querySelector("#accountHint").textContent = dangoAuthErrorText(error.message, mode);
    if (error.message === "user_not_found") setAuthMode("create");
    if (error.message === "user_already_exists") setAuthMode("login");
  }
}

function setAuthMode(mode) {
  if (typeof state !== "undefined") state.authMode = mode;
  if (typeof authMode !== "undefined") authMode = mode;

  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.authMode === mode);
  });

  const isReset = mode === "reset";
  const isCreate = mode === "create";
  document.querySelector("#loginInput").classList.toggle("hidden", mode === "login");
  document.querySelector("#loginInput").required = isCreate || isReset;
  document.querySelector("#resetCodeInput")?.classList.toggle("hidden", !isReset);
  document.querySelector("#resetCodeInput")?.toggleAttribute("required", isReset);
  document.querySelector("#authSubmitButton").textContent = isCreate
    ? "Создать аккаунт"
    : isReset
      ? "Сменить пароль"
      : "Войти в аккаунт";
  document.querySelector("#accountTitle").textContent = isCreate
    ? "Создать профиль"
    : isReset
      ? "Сменить пароль"
      : "Войти в профиль";
  document.querySelector("#accountHint").textContent = isCreate
    ? "Придумайте логин, укажите почту и пароль."
    : isReset
      ? "Введите почту, логин, получите код и задайте новый пароль минимум 6 символов."
      : "Введите почту и пароль от уже созданного аккаунта.";
}

function installResetPasswordControls() {
  // Google login and the password-reset flow were removed from the UI.
  // Authentication is e-mail + password only (stored in the database).
}

dangoFinishGoogleRedirect();
