document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".update-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            const studentId = button.dataset.id;
            const paidFeesInput = document.querySelector(`.paidFees[data-id="${studentId}"]`);
            const remainingFeesCell = button.closest("tr").querySelector(".remainingFees");

            if (!paidFeesInput) return alert("Error: Paid fees input not found!");

            const paidFees = parseFloat(paidFeesInput.value) || 0;

            try {
                const response = await fetch(`/students/update-fees/${studentId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ paidFees }),
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(`✅ Fees updated! Remaining Fees: ₹${data.remainingFees}`);

                    // ✅ Update remaining fees on UI
                    remainingFeesCell.textContent = `₹${data.remainingFees}`;
                } else {
                    alert("❌ Error updating fees.");
                }
            } catch (error) {
                console.error("❌ Error:", error);
                alert("❌ Something went wrong.");
            }
        });
    });

    // Prevent past dates in reminder scheduler
    const reminderDateInput = document.getElementById("reminderDate");
    if (reminderDateInput) {
        const today = new Date().toISOString().split("T")[0];
        reminderDateInput.setAttribute("min", today);
    }

    // Handle Reminder Form Submission
    const reminderForm = document.getElementById("reminderForm");
    if (reminderForm) {
        reminderForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const reminderDate = document.getElementById("reminderDate").value;
            const reminderTime = document.getElementById("reminderTime").value;

            if (!reminderDate || !reminderTime) {
                return alert("❌ Please select a valid date and time!");
            }

            try {
                const response = await fetch("/students/schedule-reminder", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ reminderDate, reminderTime }),
                });

                if (response.ok) {
                    alert("✅ Reminder scheduled successfully!");
                    reminderForm.reset();
                } else {
                    alert("❌ Error scheduling reminder.");
                }
            } catch (error) {
                console.error("❌ Error:", error);
                alert("❌ Something went wrong.");
            }
        });
    }
});
