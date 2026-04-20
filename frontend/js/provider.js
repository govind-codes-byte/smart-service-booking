// provider.js — service provider dashboard

let editingServiceId = null;

async function loadProviderServices() {
  const container = document.getElementById("services-list");
  container.innerHTML = `<div class="loading-overlay"><div class="spinner"></div></div>`;
  try {
    const services = await api.get("/api/provider/services");
    if (!services.length) {
      container.innerHTML = `<div class="empty-state">
        <div class="icon">🛠️</div><h3>No services yet</h3>
        <p>Add your first service to start getting bookings.</p>
      </div>`;
      return;
    }
    container.innerHTML = `<div class="grid-3">
      ${services.map(s => `
        <div class="service-card">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="service-icon">${CATEGORY_ICONS[s.category] || "🛠️"}</div>
            <span class="badge badge-category">${s.category}</span>
          </div>
          <div class="service-title">${s.title}</div>
          <div class="service-desc">${(s.description || "").slice(0, 80)}${s.description && s.description.length > 80 ? "…" : ""}</div>
          <div class="service-meta">
            <span class="service-price">₹${s.price}/hr</span>
            <span class="service-rating">★ ${s.rating ? s.rating.toFixed(1) : "New"}</span>
          </div>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button class="btn btn-outline btn-sm" onclick="openEditService('${s._id}', '${escapeAttr(s.title)}', '${s.category}', '${escapeAttr(s.description)}', ${s.price})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteService('${s._id}')">Delete</button>
          </div>
        </div>`).join("")}
    </div>`;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);padding:20px">Error loading services: ${err.message}</p>`;
  }
}

function escapeAttr(s) {
  return (s || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, "&quot;").replace(/\n/g, " ");
}

async function loadProviderBookings() {
  const container = document.getElementById("bookings-list");
  container.innerHTML = `<div class="loading-overlay"><div class="spinner"></div></div>`;
  try {
    const bookings = await api.get("/api/provider/bookings");
    if (!bookings.length) {
      container.innerHTML = `<div class="empty-state">
        <div class="icon">📋</div>
        <h3>No bookings yet</h3>
        <p>Your bookings will appear here once customers book your services.</p>
      </div>`;
      return;
    }
    container.innerHTML = `<div class="table-wrap"><table>
      <thead><tr>
        <th>Customer</th><th>Service</th><th>Date</th><th>Time</th>
        <th>Address</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody>
        ${bookings.map(b => `
          <tr>
            <td>${b.userName || "—"}</td>
            <td><strong>${b.serviceTitle || "—"}</strong></td>
            <td>${b.date || "—"}</td>
            <td>${b.time || "—"}</td>
            <td style="max-width:160px;word-break:break-word">${b.address || "—"}</td>
            <td><span class="status-badge status-${b.status}">${b.status}</span></td>
            <td style="display:flex;gap:6px;flex-wrap:wrap;min-width:140px">
              ${b.status === "pending" ? `
                <button class="btn btn-success btn-sm" onclick="updateBookingStatus('${b._id}','accepted')">Accept</button>
                <button class="btn btn-danger btn-sm" onclick="updateBookingStatus('${b._id}','cancelled')">Reject</button>
              ` : ""}
              ${b.status === "accepted" ? `
                <button class="btn btn-primary btn-sm" onclick="updateBookingStatus('${b._id}','completed')">Complete</button>
                <button class="btn btn-danger btn-sm" onclick="updateBookingStatus('${b._id}','cancelled')">Cancel</button>
              ` : ""}
              ${b.status === "completed" || b.status === "cancelled" ? `<span style="color:var(--text-dim);font-size:.8rem">${b.status}</span>` : ""}
            </td>
          </tr>`).join("")}
      </tbody></table></div>`;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);padding:20px">Error loading bookings: ${err.message}</p>`;
  }
}

async function updateBookingStatus(bookingId, status) {
  try {
    await api.put(`/api/book/${bookingId}/status`, { status });
    showToast(`Booking marked as ${status}`, "success");
    loadProviderBookings();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function openAddService() {
  editingServiceId = null;
  document.getElementById("service-modal-title").textContent = "Add New Service";
  // Manually clear all fields (no form element to .reset())
  document.getElementById("svc-title").value = "";
  document.getElementById("svc-category").value = "";
  document.getElementById("svc-desc").value = "";
  document.getElementById("svc-price").value = "";
  openModal("service-modal");
}

function openEditService(id, title, category, description, price) {
  editingServiceId = id;
  document.getElementById("service-modal-title").textContent = "Edit Service";
  document.getElementById("svc-title").value = title;
  document.getElementById("svc-category").value = category;
  document.getElementById("svc-desc").value = description;
  document.getElementById("svc-price").value = price;
  openModal("service-modal");
}

async function saveService() {
  const title = document.getElementById("svc-title").value.trim();
  const category = document.getElementById("svc-category").value;
  const description = document.getElementById("svc-desc").value.trim();
  const price = document.getElementById("svc-price").value;
  const btn = document.getElementById("save-service-btn");

  if (!title || !category || !description || !price) {
    showToast("Please fill in all fields", "error");
    return;
  }
  if (parseFloat(price) <= 0) {
    showToast("Price must be greater than 0", "error");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Saving…";
  try {
    if (editingServiceId) {
      await api.put(`/api/services/${editingServiceId}`, { title, category, description, price });
      showToast("Service updated successfully!", "success");
    } else {
      await api.post("/api/services", { title, category, description, price });
      showToast("Service added successfully!", "success");
    }
    closeModal("service-modal");
    loadProviderServices();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save Service";
  }
}

async function deleteService(id) {
  if (!confirm("Delete this service? This cannot be undone.")) return;
  try {
    await api.delete(`/api/services/${id}`);
    showToast("Service deleted", "info");
    loadProviderServices();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function openModal(id) { document.getElementById(id)?.classList.add("active"); }
function closeModal(id) { document.getElementById(id)?.classList.remove("active"); }

function setTab(tab) {
  document.querySelectorAll(".sidebar-item").forEach(el => {
    el.classList.toggle("active", el.dataset.tab === tab);
  });
  document.querySelectorAll(".tab-panel").forEach(el => {
    el.style.display = el.id === `tab-${tab}` ? "block" : "none";
  });
  if (tab === "services") loadProviderServices();
  if (tab === "bookings") loadProviderBookings();
}

async function populateCategories() {
  try {
    const data = await api.get("/api/services/categories", false);
    const sel = document.getElementById("svc-category");
    sel.innerHTML = `<option value="">— Select category —</option>` +
      data.categories.map(c => `<option value="${c}">${c}</option>`).join("");
  } catch (err) {
    console.error("Failed to load categories:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth("provider")) return;

  const user = getUser();
  document.getElementById("provider-name").textContent = user.name;
  document.getElementById("provider-email").textContent = user.email;
  updateNavbar();
  populateCategories();

  document.querySelectorAll(".sidebar-item").forEach(el => {
    el.addEventListener("click", () => setTab(el.dataset.tab));
  });

  document.getElementById("add-service-btn")?.addEventListener("click", openAddService);
  document.getElementById("save-service-btn")?.addEventListener("click", saveService);
  document.getElementById("logout-btn")?.addEventListener("click", logout);

  document.querySelectorAll(".modal-overlay").forEach(m => {
    m.addEventListener("click", e => { if (e.target === m) m.classList.remove("active"); });
  });

  setTab("services");
});
