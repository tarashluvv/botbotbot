const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');

// --- BARE MINIMUM EXPRESS SERVER (Just to keep Render from crashing) ---
const app = express();
const port = process.env.PORT || 3000; 

app.get('/', (req, res) => {
    res.send('Bot is running in the background.'); // Plain text, no HTML or images
});

app.listen(port, () => {
    console.log(`Health-check server running on port ${port}`);
});


// --- WHATSAPP CLIENT SETUP ---
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

// 1. Send the QR code DIRECTLY to n8n
client.on('qr', async (qr) => {
    console.log('QR Code generated! Sending to n8n...');
    try {
        await fetch('YOUR_N8N_WEBHOOK_URL_HERE', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                event: 'qr_ready',
                qr_string: qr 
            })
        });
        console.log('Successfully sent QR to n8n!');
    } catch (err) {
        console.error('Failed to send QR to n8n', err);
    }
});

// 2. Confirm login
client.on('ready', () => {
    console.log('✅ WhatsApp Bot is logged in and ready!');
});

// 3. Listen for incoming messages
client.on('message', async (message) => {
    const chat = await message.getChat();

    // STRICT GROUP CHECK
    if (!chat.isGroup || chat.name !== 'jabai') return; 

    const text = message.body.toLowerCase();

    // Trigger: "фулл дэй"
    if (text.includes('фулл дэй')) {
        message.reply('порно'); 
    }
});

// Start the bot
client.initialize();