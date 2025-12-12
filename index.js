const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay, fetchLatestBaileysVersion, generateWAMessageFromContent, generateForwardMessageContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const chalk = require('chalk');
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif');
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, runtime, clockString } = require('./lib/myfunc');
const { state, saveState } = require('./lib/store');
const config = require('./config');
const button = require('./lib/button');
const store = require('./lib/store');
const group = require('./lib/group');
const owner = require('./lib/owner');
const admin = require('./lib/admin');

// Database
const database = require('./database.json');
function saveDatabase() {
    fs.writeFileSync('./database.json', JSON.stringify(database, null, 2));
}

// Cek dan buat folder session
if (!fs.existsSync(config.sessionName)) {
    fs.mkdirSync(config.sessionName, { recursive: true });
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    });

    // Menyimpan kredensial
    sock.ev.on('creds.update', saveCreds);

    // Menangani koneksi
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(chalk.red('Connection closed, reconnecting...'));
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log(chalk.green('Bot connected successfully!'));
        }
    });

    // Menangani pesan
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;
        const messageType = Object.keys(msg.message)[0];
        const text = msg.message.conversation || (msg.message[messageType] && msg.message[messageType].text) || '';
        const sender = msg.key.remoteJid;
        const fromMe = msg.key.fromMe;
        const isGroup = sender.endsWith('@g.us');
        const pushName = msg.pushName || 'User';
        const body = text.toLowerCase();
        const args = text.trim().split(/ +/).slice(1);
        const command = text.trim().split(/ +/).shift().toLowerCase();

        // Jika pesan dari grup, abaikan jika tidak ada command
        if (isGroup && !body.startsWith(config.prefix)) return;

        // Jika pesan dari bot sendiri, abaikan
        if (fromMe) return;

        // Cek apakah pengguna sudah terdaftar
        if (!database.users[sender] && !command.startsWith(config.prefix + 'daftar')) {
            await sock.sendMessage(sender, { 
                text: `⚠️ Kamu belum terdaftar.\nFormat: ${config.prefix}daftar nama.umur`,
                buttons: [
                    { buttonId: '#daftar', buttonText: { displayText: 'Verifed my Account ✔️' }, type: 1 }
                ]
            }, { quoted: msg });
            return;
        }

        // Command handler
        switch (command) {
            case config.prefix + 'menu':
                await button.sendMenu(sock, sender, pushName, msg);
                break;
            case config.prefix + 'daftar':
                if (database.users[sender]) {
                    await sock.sendMessage(sender, { text: 'Kamu sudah terdaftar!' }, { quoted: msg });
                    return;
                }
                if (args.length < 1) {
                    await sock.sendMessage(sender, { text: `Format: ${config.prefix}daftar nama.umur` }, { quoted: msg });
                    return;
                }
                const data = args[0].split('.');
                if (data.length < 2) {
                    await sock.sendMessage(sender, { text: `Format: ${config.prefix}daftar nama.umur` }, { quoted: msg });
                    return;
                }
                const nama = data[0];
                const umur = parseInt(data[1]);
                if (isNaN(umur)) {
                    await sock.sendMessage(sender, { text: 'Umur harus angka!' }, { quoted: msg });
                    return;
                }
                database.users[sender] = {
                    nama,
                    umur,
                    balance: 0,
                    premium: false,
                    registeredAt: new Date().toISOString()
                };
                saveDatabase();
                // Kirim pesan verifikasi berhasil
                await sock.sendMessage(sender, { 
                    text: `✔ Verifikasi Berhasil!\nHalo ${nama}, akun Anda telah berhasil diverifikasi.\nSekarang Anda dapat menggunakan bot ini.`,
                    buttons: [
                        { buttonId: '#menu', buttonText: { displayText: '📋 Buka Menu' }, type: 1 },
                        { buttonId: '#store', buttonText: { displayText: '🛍️ Lihat Produk' }, type: 1 }
                    ]
                }, { quoted: msg });
                break;
            case config.prefix + 'store':
                await store.sendStoreMenu(sock, sender, msg);
                break;
            case config.prefix + 'group':
                await group.sendGroupMenu(sock, sender, msg);
                break;
            case config.prefix + 'owner':
                await owner.sendOwnerMenu(sock, sender, msg);
                break;
            case config.prefix + 'admin':
                await admin.sendAdminMenu(sock, sender, msg);
                break;
            default:
                // Jika command tidak dikenali, kirim menu utama
                if (body.startsWith(config.prefix)) {
                    await sock.sendMessage(sender, { text: 'Command tidak dikenali. Silakan gunakan #menu untuk melihat menu.' }, { quoted: msg });
                }
                break;
        }
    });

    // Menangani tombol
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (msg.message?.buttonsResponseMessage) {
            const buttonId = msg.message.buttonsResponseMessage.selectedButtonId;
            const sender = msg.key.remoteJid;
            const fromMe = msg.key.fromMe;
            if (fromMe) return;
            switch (buttonId) {
                case '#menu':
                    await button.sendMenu(sock, sender, msg.pushName, msg);
                    break;
                case '#store':
                    await store.sendStoreMenu(sock, sender, msg);
                    break;
                case '#group':
                    await group.sendGroupMenu(sock, sender, msg);
                    break;
                case '#owner':
                    await owner.sendOwnerMenu(sock, sender, msg);
                    break;
                case '#admin':
                    await admin.sendAdminMenu(sock, sender, msg);
                    break;
                default:
                    // Jika tombol tidak dikenali, kirim menu utama
                    await button.sendMenu(sock, sender, msg.pushName, msg);
                    break;
            }
        }
    });

    // Menangani pesan grup
    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        
        if (action === 'add') {
            // Kirim welcome video
            if (database.groups[id]?.welcome) {
                const video = fs.readFileSync(config.welcomeVideo);
                await sock.sendMessage(id, { 
                    video: video,
                    caption: 'Selamat datang di grup!'
                });
            }
        } else if (action === 'remove') {
            // Kirim leave message
            if (database.groups[id]?.leave) {
                await sock.sendMessage(id, { 
                    text: 'Seseorang telah meninggalkan grup!'
                });
            }
        }
    });
}

startBot();
