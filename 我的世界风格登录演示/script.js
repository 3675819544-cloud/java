/* ============================================================
   BlockCraft · 登录页交互
   1. 密码显示 / 隐藏
   2. 表单校验（错误红框 + 提示文字）
   3. 提交时播放像素进度条（模拟「加载世界中」）
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
  const barFill = document.getElementById('barFill');
  const barText = document.getElementById('barText');

  const REMEMBER_KEY = 'blockcraft.rememberedUser';
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* ---------------- 1. 密码显示 / 隐藏 ---------------- */
  togglePassword.addEventListener('click', function () {
    const willShow = passwordInput.type === 'password';
    passwordInput.type = willShow ? 'text' : 'password';
    togglePassword.textContent = willShow ? '隐藏' : '显示';
    passwordInput.focus();
  });

  /* ---------------- 2. 校验工具 ---------------- */
  function showError(input, errorEl, message) {
    input.closest('.slot').classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');
    errorEl.textContent = message;
  }

  function clearError(input, errorEl) {
    input.closest('.slot').classList.remove('has-error');
    input.removeAttribute('aria-invalid');
    errorEl.textContent = '';
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    if (!value) {
      showError(emailInput, emailError, '请输入账号');
      return false;
    }
    // 含 @ 时按邮箱严格校验，否则视为游戏用户名
    if (value.includes('@') && !EMAIL_RE.test(value)) {
      showError(emailInput, emailError, '邮箱格式不正确');
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
      showError(passwordInput, passwordError, '密码至少 6 位');
      return false;
    }
    clearError(passwordInput, passwordError);
    return true;
  }

  /* 失焦即校验，输入即清除错误 */
  emailInput.addEventListener('blur', validateEmail);
  passwordInput.addEventListener('blur', validatePassword);
  emailInput.addEventListener('input', function () {
    clearError(emailInput, emailError);
  });
  passwordInput.addEventListener('input', function () {
    clearError(passwordInput, passwordError);
  });

  /* ---------------- 3. 提交 + 像素进度条 ---------------- */
  let progressTimer = null;

  function runProgressBar(duration, onDone) {
    const start = performance.now();

    function frame(now) {
      const ratio = Math.min((now - start) / duration, 1);
      const percent = Math.floor(ratio * 100);

      barFill.style.width = percent + '%';
      barText.textContent =
        percent < 100 ? '加载世界中… ' + percent + '%' : '正在进入服务器…';

      if (ratio < 1) {
        progressTimer = requestAnimationFrame(frame);
      } else {
        onDone();
      }
    }

    progressTimer = requestAnimationFrame(frame);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const okEmail = validateEmail();
    const okPassword = validatePassword();
    if (!okEmail || !okPassword) {
      (okEmail ? passwordInput : emailInput).focus();
      return;
    }

    // 进入加载态
    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;
    barFill.style.width = '0%';

    // TODO: 替换为真实登录请求
    // fetch('/api/login', { method: 'POST', body: ... })
    runProgressBar(1400, function () {
      // 记住我
      try {
        if (rememberBox.checked) {
          localStorage.setItem(REMEMBER_KEY, emailInput.value.trim());
        } else {
          localStorage.removeItem(REMEMBER_KEY);
        }
      } catch (err) {
        /* 隐私模式下 localStorage 不可用，忽略 */
      }

      // 复位按钮
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
      barFill.style.width = '0%';
      barText.textContent = '加载世界中… 0%';

      alert('登录成功！正在生成你的世界…');
    });
  });

  window.addEventListener('pagehide', function () {
    if (progressTimer) cancelAnimationFrame(progressTimer);
  });

  /* ---------------- 4. 回填「记住我」 ---------------- */
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
