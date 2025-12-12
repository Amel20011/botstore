const config = require('../config');
const fs = require('fs');

module.exports = {
    sendOwnerMenu: async (sock, sender, msg) => {
        const thumb = fs.readFileSync(config.thumb);
        const ownerMenuText = `
──────────────────────────────
│            MENU OWNER
──────────────────────────────
• Add Premium User
• Del Premium User
• Add Balance / Minus Balance
• Broadcast (Teks / Media)
• Set Welcome Video
• Set Banner Store
• Set List Produk
• Aktif/Nonaktif Fitur Grup
• Restart Bot
• Backup Database
• Mode Private / Public
• Speedtest Server
• System Info
`;
        await sock.sendMessage(sender, {
            image: thumb,
            caption: ownerMenuText,
            buttons: [
                { buttonId: '#menu', buttonText: { displayText: '📋 Kembali ke Menu' }, type: 1 }
            ]
        }, { quoted: msg });
    }
};
