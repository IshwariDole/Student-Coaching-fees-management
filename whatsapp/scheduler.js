const { sendMessage } = require('../whatsapp/whatsapp'); // Import sendMessage from whatsapp.js

// Schedule WhatsApp message at a specific time
function scheduleMessage(phone, message, reminderDate, reminderTime) {
    const reminderDateTime = new Date(`${reminderDate}T${reminderTime}:00`);

    // Check if the reminder time is valid
    if (isNaN(reminderDateTime.getTime())) {
        console.error("❌ Invalid date/time:", reminderDateTime);
        return;
    }

    const timeDifference = reminderDateTime.getTime() - Date.now();
    if (timeDifference <= 0) {
        console.log("❌ The scheduled time is in the past, skipping...");
        return;
    }

    // Schedule the message to be sent at the given time
    setTimeout(() => {
        sendMessage(phone, message);
        console.log(`✅ Sent reminder to ${phone}: ${message}`);
    }, timeDifference);
}

module.exports = { scheduleMessage };
