// booking.js — handles booking form submission and review submission

async function submitBooking() {
  const serviceId = document.getElementById("booking-service-id").value;
  const date = document.getElementById("booking-date").value;
  const time = document.getElementById("booking-time").value;
  const address = document.getElementById("booking-address").value.trim();
  const btn = document.getElementById("confirm-booking-btn");

  if (!date || !time || !address) {
    showToast("Please fill in all booking details", "error");
    return;
  }

  btn.disabled = true; btn.textContent = "Booking…";
  try {
    await api.post("/api/book", { serviceId, date, time, address });
    showToast("Booking confirmed! 🎉", "success");
    closeModal("booking-modal");
    // Reset form
    document.getElementById("booking-date").value = "";
    document.getElementById("booking-time").value = "";
    document.getElementById("booking-address").value = "";
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false; btn.textContent = "Confirm Booking";
  }
}

async function submitReview(serviceId) {
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
    showToast("Review submitted! Thank you.", "success");
    closeModal("review-modal");
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false; btn.textContent = "Submit Review";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("confirm-booking-btn")?.addEventListener("click", submitBooking);
});
