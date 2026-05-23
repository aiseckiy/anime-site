function dangoAuthErrorText(code, mode) {
  const messages = {
    user_not_found: "Аккаунт не найден. Переключил на регистрацию: придумайте логин и создайте профиль.",
    wrong_password: "Неверный пароль. Проверьте раскладку или войдите с паролем, который указывали при регистрации.",
    invalid_credentials: "Неверная почта или пароль. Если аккаунта еще нет, нажмите Регистрация.",
    user_already_exists: "Аккаунт с этой почтой уже есть. Переключил на вход: введите его пароль.",
    email_password_required: "Введите почту и пароль.",
    login_email_password_required: "Для регистрации нужны логин, почта и пароль минимум 6 символов.",
    register_failed: "Регистрация не прошла. Попробуйте еще раз.",
    api_error: "Сервер не принял запрос. Попробуйте еще раз."
  };
  return messages[code] || `${mode === "create" ? "Ошибка регистрации" : "Ошибка входа"}: ${code}`;
}

async function createAccount(mode = state?.authMode || "login") {
  const login = $("#loginInput").value.trim();
  const email = $("#emailInput").value.trim();
  const password = $("#passwordInput").value;
  const path = mode === "create" ? "/api/auth/register" : "/api/auth/login";

  if (mode === "create" && !login) {
    $("#accountHint").textContent = "Для регистрации нужен логин.";
    return;
  }

  try {
    const payload = mode === "create" ? { login, email, password } : { email, password };
    const data = await api(path, { method: "POST", body: JSON.stringify(payload) });
    localStorage.setItem("dangoToken", data.token);
    localStorage.setItem("dangoBackendUser", JSON.stringify(data.user));
    state.user = data.user;
    await loadProfile();
    renderAccount();
  } catch (error) {
    $("#accountHint").textContent = dangoAuthErrorText(error.message, mode);
    if (error.message === "user_not_found") setAuthMode("create");
    if (error.message === "user_already_exists") setAuthMode("login");
  }
}
