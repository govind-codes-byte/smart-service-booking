// admin.js — admin panel logic

async function loadStats() {
  try {
    const s = await api.get("/api/admin/stats");
    document.getElementById("stat-users").textContent = s.users;
    document.getElementById("stat-services").textContent = s.services;
    document.getElementById("stat-bookings").textContent = s.bookings;
    document.getElementById("stat-reviews").textContent = s.reviews;
  } catch (err) {
    showToast("Failed to load stats: " + err.message, "error");
  }
}

async function loadUsers() {
  const container = document.getElementById("users-list");
  container.innerHTML = `<div class="loading-overlay"><div class="spinner"></div></div>`;
  try {
    const users = await api.get("/api/admin/users");
    if (!users.length) {
      container.innerHTML = `<div class="empty-state"><div class="icon">👥</div><h3>No users</h3></div>`;
      return;
    }
    container.innerHTML = `<div class="table-wrap"><table>
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Joined</th><th>Action</th></tr></thead>
      <tbody>
        ${users.map(u => `
          <tr>
            <td><strong>${u.name}</strong></td>
            <td>${u.email}</td>
            <td><span class="badge badge-category">${u.role}</span></td>
            <td>${u.phone || "—"}</td>
            <td>${new Date(u.createdAt).toLocaleDateString()}</td>
            <td>${u.role !== "admin" ? `<button class="btn btn-danger btn-sm" onclick="deleteUser('${u._id}')">Delete</button>` : "—"}</td>
          </tr>`).join("")}
      </tbody></table></div>`;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger)">Error: ${err.message}</p>`;
  }
}

async function deleteUser(id) {
  if (!confirm("Permanently delete this user?")) return;
  try {
    await api.delete(`/api/admin/users/${id}`);
    showToast("User deleted", "info");
    loadUsers();
    loadStats();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function loadAdminServices() {
  const container = document.getElementById("services-list");
  container.innerHTML = `<div class="loading-overlay"><div class="spinner"></div></div>`;
  try {
    const services = await api.get("/api/admin/services");
    if (!services.length) {
      container.innerHTML = `<div class="empty-state"><div class="icon">🛠️</div><h3>No services</h3></div>`;
      return;
    }
    container.innerHTML = `<div class="table-wrap"><table>
      <thead><tr><th>Title</th><th>Category</th><th>Provider</th><th>Price</th><th>Rating</th><th>Action</th></tr></thead>
      <tbody>
        ${services.map(s => `
          <tr>
            <td><strong>${s.title}</strong></td>
            <td>${s.category}</td>
            <td>${s.providerName}</td>
            <td>₹${s.price}/hr</td>
            <td>★ ${s.rating ? s.rating.toFixed(1) : "New"}</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteAdminService('${s._id}')">Delete</button></td>
          </tr>`).join("")}
      </tbody></table></div>`;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger)">Error: ${err.message}</p>`;
  }
}

async function deleteAdminService(id) {
  if (!confirm("Delete this service?")) return;
  try {
    await api.delete(`/api/admin/services/${id}`);
    showToast("Service deleted", "info");
    loadAdminServices();
    loadStats();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function loadAdminBookings() {
  const container = document.getElementById("bookings-list");
  container.innerHTML = `<div class="loading-overlay"><div class="spinner"></div></div>`;
  try {
    const bookings = await api.get("/api/admin/bookings");
    if (!bookings.length) {
      container.innerHTML = `<div class="empty-state"><div class="icon">📋</div><h3>No bookings</h3></div>`;
      return;
    }
    container.innerHTML = `<div class="table-wrap"><table>
      <thead><tr><th>Customer</th><th>Service</th><th>Provider</th><th>Date</th><th>Status</th></tr></thead>
      <tbody>
        ${bookings.map(b => `
          <tr>
            <td>${b.userName}</td>
            <td><strong>${b.serviceTitle}</strong></td>
            <td>${b.providerId}</td>
            <td>${b.date} ${b.time}</td>
            <td><span class="status-badge status-${b.status}">${b.status}</span></td>
          </tr>`).join("")}
      </tbody></table></div>`;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger)">Error: ${err.message}</p>`;
  }
}

function setTab(tab) {
  document.querySelectorAll(".sidebar-item").forEach(el =>
    el.classList.toggle("active", el.dataset.tab === tab));
  document.querySelectorAll(".tab-panel").forEach(el =>
    (el.style.display = el.id === `tab-${tab}` ? "block" : "none"));
  if (tab === "overview") loadStats();
  if (tab === "users") loadUsers();
  if (tab === "services") loadAdminServices();
  if (tab === "bookings") loadAdminBookings();
}

document.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth("admin")) return;
  const user = getUser();
  document.getElementById("admin-name").textContent = user.name;
  updateNavbar();

  document.querySelectorAll(".sidebar-item").forEach(el =>
    el.addEventListener("click", () => setTab(el.dataset.tab)));
  document.getElementById("logout-btn")?.addEventListener("click", logout);

  setTab("overview");
});
