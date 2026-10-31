/* Показать или скрыть пароль */
function initPasswordToggles(form) {
  const icons = form.querySelectorAll(".auth-password__icon");

  icons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const input = icon.previousElementSibling;

      if (!(input instanceof HTMLInputElement)) return;

      const isHidden = input.type === "password";

      input.type = isHidden ? "text" : "password";

      icon.src = isHidden
        ? "../assets/images/icons/eye-icon.svg"
        : "../assets/images/icons/eye_hidden-icon.svg";

      icon.alt = isHidden ? "Скрыть пароль" : "Показать пароль";
    });
  });
}

/* Проверка совпадения паролей */
function initPasswordMatch(form) {
  const password = form.querySelector('[name="password"]');
  const repeat = form.querySelector('[name="password-repeat"]');

  if (!password || !repeat) return;

  function validatePasswordMatch() {
    const mismatch = repeat.value !== "" && repeat.value !== password.value;

    repeat.setCustomValidity(mismatch ? "Пароли не совпадают" : "");
  }

  password.addEventListener("input", validatePasswordMatch);
  repeat.addEventListener("input", validatePasswordMatch);
}

function resetPasswordToggles(form) {
  form.querySelectorAll(".auth-password__icon").forEach((icon) => {
    const input = icon.previousElementSibling;

    if (!(input instanceof HTMLInputElement)) return;

    input.type = "password";
    icon.src = "../assets/images/icons/eye_hidden-icon.svg";
    icon.alt = "Показать пароль";
  });
}

/* Обработка отправки формы */
function initFormSubmit(form) {
  form.addEventListener("submit", (event) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      return;
    }
    event.preventDefault();

    alert("Форма успешно отправлена");

    form.reset();
    resetPasswordToggles(form);

    const repeat = form.querySelector('[name="password-repeat"]');

    if (repeat) {
      repeat.setCustomValidity("");
    }
  });
}

/* Инициализация форм авторизации */
function initAuthForms() {
  document.querySelectorAll(".form-auth").forEach((form) => {
    initPasswordToggles(form);
    initPasswordMatch(form);
    initFormSubmit(form);
  });
}

initAuthForms();
