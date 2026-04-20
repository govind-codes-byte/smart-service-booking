const API_BASE = "";  // Same origin via Flask

const api = {
  async request(method, path, body = null, auth = true) {
    const headers = { "Content-Type": "application/json" };
    // Only skip token when auth is explicitly === false (public endpoints)
    if (auth !== false) {
      const token = localStorage.getItem("token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    try {
      const res = await fetch(API_BASE + path, opts);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data;
    } catch (err) {
      throw err;
    }
  },
  // Pass false as last arg for public (no-auth) endpoints, e.g. api.get("/api/services", false)
  get:    (path, auth = true)       => api.request("GET",    path, null, auth),
  post:   (path, body, auth = true) => api.request("POST",   path, body, auth),
  put:    (path, body, auth = true) => api.request("PUT",    path, body, auth),
  delete: (path, auth = true)       => api.request("DELETE", path, null, auth),
};

function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const icons = { success: "✓", error: "✕", info: "ℹ" };
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || "•"}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function getUser() {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
}

function isLoggedIn() {
  return !!localStorage.getItem("token");
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login.html";
}

function requireAuth(role) {
  if (!isLoggedIn()) { window.location.href = "/login.html"; return false; }
  const user = getUser();
  if (role && user?.role !== role) {
    showToast("Access denied", "error");
    window.location.href = "/index.html";
    return false;
  }
  return true;
}

function updateNavbar() {
  const user = getUser();
  const guestLinks = document.getElementById("guest-links");
  const userLinks = document.getElementById("user-links");
  const adminLink = document.getElementById("admin-link");
  const providerLink = document.getElementById("provider-link");
  const userNameEl = document.getElementById("nav-username");

  if (user) {
    if (guestLinks) guestLinks.style.display = "none";
    if (userLinks) userLinks.style.display = "flex";
    if (userNameEl) userNameEl.textContent = user.name;
    if (adminLink) adminLink.style.display = user.role === "admin" ? "inline-flex" : "none";
    if (providerLink) providerLink.style.display = user.role === "provider" ? "inline-flex" : "none";
  } else {
    if (guestLinks) guestLinks.style.display = "flex";
    if (userLinks) userLinks.style.display = "none";
  }
}

const CATEGORY_ICONS = {
  Electrician: "⚡", Plumber: "🔧", Tutor: "📚", Cleaner: "🧹",
  Carpenter: "🪚", Painter: "🎨", Mechanic: "🔩", Cook: "👨‍🍳",
  Gardener: "🌿", Other: "🛠️"
};

function starHTML(rating, max = 5) {
  let out = "";
  for (let i = 1; i <= max; i++) {
    out += `<span style="color:${i <= Math.round(rating) ? 'var(--amber)' : 'var(--text-dim)'}">★</span>`;
  }
  return out;
}
