const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ['--no-sandbox'] },
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp client is ready!');
});

client.initialize();

const app = express();
app.use(express.json());

app.post('/send', async (req, res) => {
  const { phone, message } = req.body;

  try {
    await client.sendMessage(`${phone}@c.us`, message);
    res.json({ success: true, msg: 'Message sent!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log('📡 API server running on port 3000'));
