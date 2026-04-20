// services.js — services listing page logic

let allServices = [];
let activeCategory = "All";

async function loadCategories() {
  const pills = document.getElementById("category-pills");
  if (!pills) return;
  try {
    const data = await api.get("/api/services/categories", false);
    const cats = ["All", ...data.categories];
    pills.innerHTML = cats.map(c =>
      `<button class="pill${c === "All" ? " active" : ""}" data-cat="${c}">${c}</button>`
    ).join("");
    // Apply forced category from URL param
    if (window.__forceCategory) {
      const match = [...pills.querySelectorAll(".pill")].find(p => p.dataset.cat === window.__forceCategory);
      if (match) {
        pills.querySelectorAll(".pill").forEach(x => x.classList.remove("active"));
        match.classList.add("active");
        activeCategory = window.__forceCategory;
      }
    }

    pills.querySelectorAll(".pill").forEach(p => {
      p.addEventListener("click", () => {
        pills.querySelectorAll(".pill").forEach(x => x.classList.remove("active"));
        p.classList.add("active");
        activeCategory = p.dataset.cat;
        renderServices();
      });
    });
  } catch {}
}

async function loadServices() {
  const grid = document.getElementById("services-grid");
  if (!grid) return;
  grid.innerHTML = `<div class="loading-overlay"><div class="spinner"></div></div>`;
  try {
    allServices = await api.get("/api/services", false);
    renderServices();
  } catch (err) {
    grid.innerHTML = `<p style="color:var(--danger)">Failed to load services: ${err.message}</p>`;
  }
}

function renderServices() {
  const grid = document.getElementById("services-grid");
  const search = (document.getElementById("search-input")?.value || "").toLowerCase();
  let filtered = allServices;
  if (activeCategory !== "All") filtered = filtered.filter(s => s.category === activeCategory);
  if (search) filtered = filtered.filter(s =>
    s.title.toLowerCase().includes(search) ||
    s.description.toLowerCase().includes(search) ||
    s.category.toLowerCase().includes(search)
  );

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="icon">🔍</div>
      <h3>No services found</h3>
      <p>Try a different category or search term.</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(s => `
    <div class="service-card" onclick="openServiceDetail('${s._id}')">
      <div style="display:flex;align-items:center;gap:12px">
        <div class="service-icon">${CATEGORY_ICONS[s.category] || "🛠️"}</div>
        <span class="badge badge-category">${s.category}</span>
      </div>
      <div class="service-title">${s.title}</div>
      <div class="service-desc">${s.description.slice(0, 100)}${s.description.length > 100 ? "…" : ""}</div>
      <div class="service-meta">
        <span class="service-price">₹${s.price}/hr</span>
        <span class="service-rating">
          <span class="stars">★</span> ${s.rating ? s.rating.toFixed(1) : "New"} 
          ${s.reviewCount ? `<span style="color:var(--text-dim)">(${s.reviewCount})</span>` : ""}
        </span>
      </div>
      <div class="service-provider">👤 ${s.providerName}</div>
    </div>
  `).join("");
}

// ── Service Detail Modal ──
async function openServiceDetail(id) {
  try {
    const s = await api.get(`/api/services/${id}`, false);
    const reviews = await api.get(`/api/reviews/${id}`, false);
    const user = getUser();

    document.getElementById("modal-icon").textContent = CATEGORY_ICONS[s.category] || "🛠️";
    document.getElementById("modal-title").textContent = s.title;
    document.getElementById("modal-category").textContent = s.category;
    document.getElementById("modal-desc").textContent = s.description;
    document.getElementById("modal-price").textContent = `₹${s.price}/hr`;
    document.getElementById("modal-provider").textContent = s.providerName;
    document.getElementById("modal-rating").innerHTML =
      `${starHTML(s.rating)} ${s.rating ? s.rating.toFixed(1) : "No ratings yet"}`;

    const reviewsEl = document.getElementById("modal-reviews");
    reviewsEl.innerHTML = reviews.length
      ? reviews.map(r => `
          <div style="padding:12px 0;border-bottom:1px solid var(--border)">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <strong>${r.userName}</strong>
              <span>${starHTML(r.rating)}</span>
            </div>
            <p style="font-size:.88rem;color:var(--text-muted)">${r.comment}</p>
          </div>`).join("")
      : `<p style="color:var(--text-muted);font-size:.88rem">No reviews yet.</p>`;

    const bookBtn = document.getElementById("modal-book-btn");
    if (user && user.role === "user") {
      bookBtn.style.display = "flex";
      bookBtn.onclick = () => {
        closeModal("service-modal");
        openBookingModal(s._id, s.title, s.price);
      };
    } else if (!user) {
      bookBtn.style.display = "flex";
      bookBtn.textContent = "Login to Book";
      bookBtn.onclick = () => window.location.href = "/login.html";
    } else {
      bookBtn.style.display = "none";
    }

    openModal("service-modal");
  } catch (err) {
    showToast("Failed to load service details", "error");
  }
}

// ── Booking Modal ──
function openBookingModal(serviceId, serviceTitle, price) {
  if (!requireAuth("user")) return;
  document.getElementById("booking-service-title").textContent = serviceTitle;
  document.getElementById("booking-price").textContent = `₹${price}/hr`;
  document.getElementById("booking-service-id").value = serviceId;
  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("booking-date").min = today;
  openModal("booking-modal");
}

// ── Modal helpers ──
function openModal(id) {
  document.getElementById(id)?.classList.add("active");
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove("active");
}

document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();
  loadCategories();
  loadServices();

  // Hamburger
  document.getElementById("hamburger")?.addEventListener("click", () => {
    document.getElementById("nav-links")?.classList.toggle("open");
  });

  // Logout
  document.getElementById("logout-btn")?.addEventListener("click", logout);

  // Search input
  document.getElementById("search-input")?.addEventListener("input", renderServices);

  // Close modals on overlay click
  document.querySelectorAll(".modal-overlay").forEach(m => {
    m.addEventListener("click", e => {
      if (e.target === m) m.classList.remove("active");
    });
  });
});
