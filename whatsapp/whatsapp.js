const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.initialize();

// ✅ Ensure Client is Ready
client.on('ready', () => {
    console.log('✅ WhatsApp Client is Ready!');
});

// 📸 Show QR Code for Authentication
client.on('qr', (qr) => {
    console.log('📸 Scan this QR Code to log in:', qr);
});

// 🔓 Successful Authentication
client.on('authenticated', () => {
    console.log('🔓 WhatsApp Client Authenticated!');
});

// 🔴 Handle Disconnection & Auto-Reconnect
client.on('disconnected', (reason) => {
    console.error("🔴 WhatsApp Web Disconnected! Reason:", reason);
    console.log("🔄 Reconnecting in 5 seconds...");
    
    setTimeout(() => {
        client.destroy();
        client.initialize();
    }, 5000);
});

// ✅ Send WhatsApp Message Function
const sendMessage = async (phone, message) => {
    try {
        if (!client.info) {
            console.error("❌ WhatsApp Client not initialized! Retrying in 5 seconds...");
            setTimeout(() => sendMessage(phone, message), 5000);
            return;
        }

        // 📌 Ensure Correct Phone Number Format (India 🇮🇳)
        let formattedPhone = phone.replace(/\D/g, ''); // Remove non-digits
        if (!formattedPhone.startsWith('91')) {
            formattedPhone = `91${formattedPhone}`;
        }
        formattedPhone = `${formattedPhone}@c.us`;

        // 🚀 Send Message
        await client.sendMessage(formattedPhone, message);
        console.log(`✅ Message sent to ${formattedPhone}`);
    } catch (error) {
        console.error(`❌ Error sending message to ${phone}:`, error);
    }
};

module.exports = { client, sendMessage };
