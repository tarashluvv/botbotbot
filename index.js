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
    // LocalAuth saves the session locally so you don't have to rescan if the server restarts
    authStrategy: new LocalAuth(),
    puppeteer: {
        // These arguments are strongly recommended to prevent crashes on cloud deployment platforms
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// 1. Generate the QR code as an image URL when requested by WhatsApp
client.on('qr', async (qr) => {
    try {
        currentQrCodeUrl = await qrcode.toDataURL(qr);
        console.log('QR Code generated! Go to your server URL to scan it.');
    } catch (err) {
        console.error('Failed to generate QR code image', err);
    }
});

// 2. Clear the QR code and confirm connection once the bot logs in
client.on('ready', () => {
    console.log('✅ WhatsApp Bot is logged in and ready!');
    currentQrCodeUrl = ''; // Clear the QR code so the webpage shows the "Connected" message
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