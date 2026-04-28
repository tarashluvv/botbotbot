const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');

// --- EXPRESS WEB SERVER SETUP ---
const app = express();
// Use the port provided by the host (like Render) or default to 3000 locally
const port = process.env.PORT || 3000; 
let currentQrCodeUrl = ''; // This will temporarily store the generated QR code image URL

// Create a simple webpage to display the QR code or connection status
app.get('/', (req, res) => {
    if (currentQrCodeUrl) {
        // If a QR code is waiting to be scanned, show it
        res.send(`
            <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                <h1>WhatsApp Bot Authentication</h1>
                <p>Scan this QR code with your WhatsApp app (Linked Devices) to connect:</p>
                <img src="${currentQrCodeUrl}" alt="QR Code" style="border: 1px solid #ccc; padding: 10px; border-radius: 10px;" />
            </div>
        `);
    } else {
        // If no QR code exists, assume the bot is successfully connected
        res.send(`
            <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                <h1 style="color: green;">✅ WhatsApp Bot is connected and running!</h1>
                <p>You can close this page.</p>
            </div>
        `);
    }
});

// Start the Express web server
app.listen(port, () => {
    console.log(`Web server is running. Open http://localhost:${port} in your browser to view the QR code.`);
});


// --- WHATSAPP CLIENT SETUP & EVENTS ---
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

// 1. Generate the QR code as an image URL when requested by WhatsApp AND send to n8n
client.on('qr', async (qr) => {
    try {
        // Keep generating the local web URL so the Render web page still works
        currentQrCodeUrl = await qrcode.toDataURL(qr);
        console.log('QR Code generated! Go to your server URL to scan it.');

        // Send the raw QR text to your n8n Webhook
        await fetch('YOUR_N8N_WEBHOOK_URL_HERE', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                event: 'qr_ready',
                qr_string: qr 
            })
        });
        
        console.log('Successfully sent QR to n8n!');
    } catch (err) {
        console.error('Failed to process or send QR code', err);
    }
});

// 3. Listen for incoming messages and reply based on your rules
client.on('message', async (message) => {
    // Get information about the chat the message came from
    const chat = await message.getChat();

    // --- STRICT GROUP CHECK ---
    const targetGroupName = 'jabai'; 

    // If it's NOT a group, OR if the name doesn't match 'jabai', ignore the message entirely
    if (!chat.isGroup || chat.name !== targetGroupName) {
        return; 
    }
    // --------------------------

    // Convert message to lowercase to make word matching case-insensitive
    const text = message.body.toLowerCase();

    // --- YOUR CUSTOM BOT RULES ---

    // Trigger: "фулл дэй"
    if (text.includes('фулл дэй')) {
        // You can change this text to whatever you want the bot to say back!
        message.reply('порно'); 
    }
});

// Start the WhatsApp client
client.initialize();