// auth.js — handles login & register forms

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = loginForm.querySelector("button[type=submit]");
      btn.disabled = true; btn.textContent = "Signing in…";
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      try {
        const data = await api.post("/api/login", { email, password }, false);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        showToast("Welcome back, " + data.user.name + "!", "success");
        setTimeout(() => {
          if (data.user.role === "admin") window.location.href = "/admin.html";
          else if (data.user.role === "provider") window.location.href = "/provider.html";
          else window.location.href = "/dashboard.html";
        }, 800);
      } catch (err) {
        showToast(err.message, "error");
        btn.disabled = false; btn.textContent = "Sign In";
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = registerForm.querySelector("button[type=submit]");
      btn.disabled = true; btn.textContent = "Creating account…";
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const phone = document.getElementById("phone").value.trim();
      const role = document.getElementById("role").value;
      if (password.length < 6) {
        showToast("Password must be at least 6 characters", "error");
        btn.disabled = false; btn.textContent = "Create Account";
        return;
      }
      try {
        const data = await api.post("/api/register", { name, email, password, phone, role }, false);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        showToast("Account created! Welcome " + data.user.name, "success");
        setTimeout(() => {
          if (data.user.role === "provider") window.location.href = "/provider.html";
          else window.location.href = "/dashboard.html";
        }, 800);
      } catch (err) {
        showToast(err.message, "error");
        btn.disabled = false; btn.textContent = "Create Account";
      }
    });
  }
});
