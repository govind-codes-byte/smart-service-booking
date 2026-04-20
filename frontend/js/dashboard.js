// dashboard.js — user dashboard logic

let currentTab = "bookings";

async function loadUserBookings() {
  const container = document.getElementById("bookings-list");
  container.innerHTML = `<div class="loading-overlay"><div class="spinner"></div></div>`;
  try {
    const bookings = await api.get("/api/user/bookings");
    if (!bookings.length) {
      container.innerHTML = `<div class="empty-state">
        <div class="icon">📋</div>
        <h3>No bookings yet</h3>
        <p>Book a service to get started!</p>
        <a href="/services.html" class="btn btn-primary" style="margin-top:16px">Browse Services</a>
      </div>`;
      return;
    }

    container.innerHTML = `<div class="table-wrap">
      <table>
        <thead><tr>
          <th>Service</th><th>Date</th><th>Time</th><th>Address</th>
          <th>Status</th><th>Action</th>
        </tr></thead>
        <tbody>
          ${bookings.map(b => `
            <tr>
              <td><strong>${b.serviceTitle}</strong></td>
              <td>${b.date}</td>
              <td>${b.time}</td>
              <td>${b.address}</td>
              <td><span class="status-badge status-${b.status}">${b.status}</span></td>
              <td>
                ${b.status === "pending" || b.status === "accepted" ? `
                  <button class="btn btn-danger btn-sm" onclick="cancelBooking('${b._id}')">Cancel</button>
                ` : ""}
                ${b.status === "completed" ? `
                  <button class="btn btn-outline btn-sm" onclick="openReviewModal('${b.serviceId}', '${b.serviceTitle}')">Review</button>
                ` : ""}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger)">Error: ${err.message}</p>`;
  }
}

async function cancelBooking(bookingId) {
  if (!confirm("Are you sure you want to cancel this booking?")) return;
  try {
    await api.put(`/api/book/${bookingId}/status`, { status: "cancelled" });
    showToast("Booking cancelled", "info");
    loadUserBookings();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function openReviewModal(serviceId, serviceTitle) {
  document.getElementById("review-service-title").textContent = serviceTitle;
  document.getElementById("review-service-id").value = serviceId;
  document.getElementById("review-comment").value = "";
  document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
  openModal("review-modal");
}

function openModal(id) {
  document.getElementById(id)?.classList.add("active");
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove("active");
}

async function submitReview() {
  const serviceId = document.getElementById("review-service-id").value;
  const ratingEl = document.querySelector('input[name="rating"]:checked');
  const comment = document.getElementById("review-comment").value.trim();
  const btn = document.getElementById("submit-review-btn");

  if (!ratingEl || !comment) {
    showToast("Please provide a rating and comment", "error");
    return;
  }
  btn.disabled = true; btn.textContent = "Submitting…";
  try {
    await api.post("/api/review", {
      serviceId,
      rating: parseInt(ratingEl.value),
      comment
    });
    showToast("Review submitted!", "success");
    closeModal("review-modal");
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false; btn.textContent = "Submit Review";
  }
}

function setTab(tab) {
  currentTab = tab;
  document.querySelectorAll(".sidebar-item").forEach(el => {
    el.classList.toggle("active", el.dataset.tab === tab);
  });
  document.querySelectorAll(".tab-panel").forEach(el => {
    el.style.display = el.id === `tab-${tab}` ? "block" : "none";
  });
  if (tab === "bookings") loadUserBookings();
}

document.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth("user")) return;
  const user = getUser();
  document.getElementById("user-name").textContent = user.name;
  document.getElementById("user-email").textContent = user.email;
  document.getElementById("user-role-badge").textContent = user.role;
  updateNavbar();

  document.querySelectorAll(".sidebar-item").forEach(el => {
    el.addEventListener("click", () => setTab(el.dataset.tab));
  });

  document.getElementById("logout-btn")?.addEventListener("click", logout);
  document.getElementById("submit-review-btn")?.addEventListener("click", submitReview);

  document.querySelectorAll(".modal-overlay").forEach(m => {
    m.addEventListener("click", e => { if (e.target === m) m.classList.remove("active"); });
  });

  setTab("bookings");
});
