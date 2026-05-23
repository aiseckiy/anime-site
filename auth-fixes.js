function dangoAuthErrorText(code, mode) {
  const messages = {
    user_not_found: "Аккаунт не найден. Переключил на регистрацию: придумайте логин и создайте профиль.",
    wrong_password: "Неверный пароль. Нажмите 'Сменить пароль', укажите почту, логин и новый пароль.",
    invalid_credentials: "Неверная почта или пароль. Если аккаунта еще нет, нажмите Регистрация.",
    user_already_exists: "Аккаунт с этой почтой уже есть. Переключил на вход: введите его пароль.",
    email_password_required: "Введите почту и пароль.",
    login_email_password_required: "Для регистрации или смены пароля нужны логин, почта и пароль минимум 6 символов.",
    reset_identity_not_found: "Не нашел аккаунт с такой почтой и логином. Проверьте логин или зарегистрируйте новый профиль.",
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
    const payload = mode === "create" || mode === "reset" ? { login, email, password } : { email, password };
    const data = await dangoAuthRequest(path, { method: "POST", body: JSON.stringify(payload) });
    await dangoApplyAuthProfile(data, mode);
  } catch (error) {
    document.querySelector("#accountHint").textContent = dangoAuthErrorText(error.message, mode);
    if (error.message === "user_not_found") setAuthMode("create");
    if (error.message === "user_already_exists") setAuthMode("login");
  }
}

function setAuthMode(mode) {
  authMode = mode;
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.authMode === mode);
  });
  document.querySelector("#loginInput").classList.toggle("hidden", mode === "login");
  document.querySelector("#loginInput").required = mode === "create" || mode === "reset";
  document.querySelector("#authSubmitButton").textContent = mode === "create"
    ? "Создать аккаунт"
    : mode === "reset"
      ? "Сменить пароль"
      : "Войти в аккаунт";
  document.querySelector("#accountTitle").textContent = mode === "create"
    ? "Создать профиль"
    : mode === "reset"
      ? "Сменить пароль"
      : "Войти в профиль";
  document.querySelector("#accountHint").textContent = mode === "create"
    ? "Придумайте логин, укажите почту и пароль."
    : mode === "reset"
      ? "Введите почту, логин и новый пароль минимум 6 символов."
      : "Введите почту и пароль от уже созданного аккаунта.";
}

function installResetPasswordButton() {
  const switcher = document.querySelector("#authSwitch");
  if (!switcher || switcher.querySelector('[data-auth-mode="reset"]')) return;
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.authMode = "reset";
  button.textContent = "Сменить пароль";
  button.addEventListener("click", () => setAuthMode("reset"));
  switcher.append(button);
}

installResetPasswordButton();
