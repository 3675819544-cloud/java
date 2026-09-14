/* ============================================================
   Nebula · 登录页交互
   1. 密码显示 / 隐藏切换
   2. 表单校验（邮箱/用户名 + 密码），错误红框 + 提示文字
   3. 提交加载动画
   4. 「记住我」本地记忆
   ============================================================ */

(function () {
  'use strict';

  /* ---------------- 元素引用 ---------------- */
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const submitBtn = document.getElementById('submitBtn');
  const togglePassword = document.getElementById('togglePassword');
  const rememberBox = document.getElementById('remember');

  const REMEMBER_KEY = 'nebula.rememberedUser';

  /* ---------------- 1. 密码显示 / 隐藏 ---------------- */
  togglePassword.addEventListener('click', function () {
    const willShow = passwordInput.type === 'password';
    passwordInput.type = willShow ? 'text' : 'password';
    togglePassword.classList.toggle('is-visible', willShow);
    togglePassword.setAttribute('aria-label', willShow ? '隐藏密码' : '显示密码');

    // 切换后光标保持在密码输入框末尾
    const end = passwordInput.value.length;
    passwordInput.focus();
    try {
      passwordInput.setSelectionRange(end, end);
    } catch (err) {
      /* 部分浏览器对 password -> text 的选区切换会抛错，忽略即可 */
    }
  });

  /* ---------------- 2. 校验工具 ---------------- */
  // 邮箱正则：仅在含 @ 时做严格校验，兼容「用户名」登录
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function showError(input, errorEl, message) {
    input.closest('.input-wrap').classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');
    errorEl.textContent = message;
    errorEl.classList.add('show');
  }

  function clearError(input, errorEl) {
    input.closest('.input-wrap').classList.remove('has-error');
    input.removeAttribute('aria-invalid');
    errorEl.textContent = '';
    errorEl.classList.remove('show');
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    if (!value) {
      showError(emailInput, emailError, '请输入邮箱或用户名');
      return false;
    }
    if (value.includes('@') && !EMAIL_RE.test(value)) {
      showError(emailInput, emailError, '邮箱格式不正确，请检查后重试');
      return false;
    }
    clearError(emailInput, emailError);
    return true;
  }

  function validatePassword() {
    const value = passwordInput.value;
    if (!value) {
      showError(passwordInput, passwordError, '请输入密码');
      return false;
    }
    if (value.length < 6) {
      showError(passwordInput, passwordError, '密码长度至少为 6 位');
      return false;
    }
    clearError(passwordInput, passwordError);
    return true;
  }

  /* ---------------- 3. 失焦即校验、输入即清除错误 ---------------- */
  emailInput.addEventListener('blur', validateEmail);
  passwordInput.addEventListener('blur', validatePassword);

  emailInput.addEventListener('input', function () {
    clearError(emailInput, emailError);
  });
  passwordInput.addEventListener('input', function () {
    clearError(passwordInput, passwordError);
  });

  /* ---------------- 4. 提交 ---------------- */
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    // 一次性校验全部字段，避免短路导致只提示一个错误
    const okEmail = validateEmail();
    const okPassword = validatePassword();
    if (!okEmail || !okPassword) {
      (okEmail ? passwordInput : emailInput).focus();
      return;
    }

    // 进入加载态
    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    // TODO: 在此处替换为真实登录接口
    // fetch('/api/login', { method: 'POST', ... })
    setTimeout(function () {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;

      if (rememberBox.checked) {
        try {
          localStorage.setItem(REMEMBER_KEY, emailInput.value.trim());
        } catch (err) {
          /* 隐私模式下 localStorage 可能不可用，忽略 */
        }
      } else {
        try {
          localStorage.removeItem(REMEMBER_KEY);
        } catch (err) {
          /* 同上 */
        }
      }

      alert('登录成功，正在进入工作空间…');
    }, 1400);
  });

  /* ---------------- 5. 回填「记住我」 ---------------- */
  try {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      emailInput.value = saved;
      rememberBox.checked = true;
      passwordInput.focus();
    }
  } catch (err) {
    /* 忽略 */
  }
})();
