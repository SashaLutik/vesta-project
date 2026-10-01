const emailSymbol = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ошибки у полей ввода */
function getErrorEl(input) {
  return document.querySelector(`.form-error[data-error-for="${input.name}"]`);
}

function showError(input, message) {
  const errorEl = getErrorEl(input);
  if (errorEl) errorEl.textContent = message;

  /* подсветка самого поля */
  input.classList.add("form-input--invalid");

  /* если поле обёрнуто в .auth-password__container — подсветим и контейнер */
  const wrapper = input.closest(".auth-password__container");
  if (wrapper) wrapper.classList.add("form-input--invalid");
}

function clearError(input) {
  const errorEl = getErrorEl(input);
  if (errorEl) errorEl.textContent = "";

  input.classList.remove("form-input--invalid");

  const wrapper = input.closest(".auth-password__container");
  if (wrapper) wrapper.classList.remove("form-input--invalid");
}

function clearAllErrors(form) {
  form.querySelectorAll(".form-error").forEach((el) => (el.textContent = ""));
  form
    .querySelectorAll(".form-input--invalid")
    .forEach((el) => el.classList.remove("form-input--invalid"));
}

/* проверка ввода */
function validateName(input) {
  if (!input.value.trim()) {
    showError(input, "*Укажите ФИО");
    return false;
  }
  clearError(input);
  return true;
}

function validateEmail(input) {
  const value = input.value.trim();
  if (!value) {
    showError(input, "*Укажите email");
    return false;
  }
  if (!emailSymbol.test(value)) {
    showError(input, "*Некорректный формат email");
    return false;
  }
  clearError(input);
  return true;
}

function validatePassword(input) {
  if (!input.value) {
    showError(input, "*Введите пароль");
    return false;
  }
  if (input.value.length < 8) {
    showError(input, "*Пароль должен содержать не менее 8 символов");
    return false;
  }
  clearError(input);
  return true;
}

function validatePasswordRepeat(passwordInput, repeatInput) {
  if (!repeatInput.value) {
    showError(repeatInput, "*Повторите пароль");
    return false;
  }
  if (repeatInput.value !== passwordInput.value) {
    showError(repeatInput, "*Пароли не совпадают");
    return false;
  }
  clearError(repeatInput);
  return true;
}

/* показать/скрыть пароль */
function initPasswordToggles(form) {
  form.querySelectorAll(".auth-password__icon").forEach((icon) => {
    icon.addEventListener("click", () => {
      const input = icon.previousElementSibling;
      if (!input || input.tagName !== "INPUT") return;

      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";

      const hiddenSrc = "../assets/images/icons/eye_hidden-icon.svg";
      const openSrc = "../assets/images/icons/eye-icon.svg";
      icon.src = isHidden ? openSrc : hiddenSrc;
      icon.alt = isHidden ? "visible eye" : "hidden eye";
    });
  });
}

function initRegistrationForm() {
  const form = document.querySelector(".form-auth");
  if (!form) return;

  const nameInput = form.querySelector('input[name="name"]');
  const emailInput = form.querySelector('input[name="email"]');
  const passwordInput = form.querySelector('input[name="password"]');
  const repeatInput = form.querySelector('input[name="password-repeat"]');

  if (!repeatInput) return;

  nameInput.addEventListener("input", () => clearError(nameInput));
  emailInput.addEventListener("input", () => clearError(emailInput));
  passwordInput.addEventListener("input", () => {
    clearError(passwordInput);
    if (repeatInput.value) clearError(repeatInput);
  });
  repeatInput.addEventListener("input", () => clearError(repeatInput));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearAllErrors(form);

    const okName = validateName(nameInput);
    const okEmail = validateEmail(emailInput);
    const okPassword = validatePassword(passwordInput);
    const okRepeat = validatePasswordRepeat(passwordInput, repeatInput);

    if (!okName) return nameInput.focus();
    if (!okEmail) return emailInput.focus();
    if (!okPassword) return passwordInput.focus();
    if (!okRepeat) return repeatInput.focus();

    form.reset();
  });
}

/*вход*/
function initLoginForm() {
  const form = document.querySelector(".form-auth");
  if (!form) return;

  if (form.querySelector('input[name="password-repeat"]')) return;

  const nameInput = form.querySelector('input[name="name"]');
  const emailInput = form.querySelector('input[name="email"]');
  const passwordInput = form.querySelector('input[name="password"]');

  nameInput.addEventListener("input", () => clearError(nameInput));
  emailInput.addEventListener("input", () => clearError(emailInput));
  passwordInput.addEventListener("input", () => clearError(passwordInput));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearAllErrors(form);

    const okName = validateName(nameInput);
    const okEmail = validateEmail(emailInput);
    const okPassword = validatePassword(passwordInput);

    if (!okName) return nameInput.focus();
    if (!okEmail) return emailInput.focus();
    if (!okPassword) return passwordInput.focus();

    alert("Вход выполнен");
    form.reset();
  });
}

function renderForm() {
  const form = document.querySelector(".form-auth");
  if (!form) return;

  initPasswordToggles(form);
  initRegistrationForm();
  initLoginForm();
}
renderForm();
