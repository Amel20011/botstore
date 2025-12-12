const config = require('../config');
const fs = require('fs');

module.exports = {
    sendMenu: async (sock, sender, pushName, msg) => {
        const thumb = fs.readFileSync(config.thumb);
        await sock.sendMessage(sender, {
            image: thumb,
            caption: `Halo ${pushName}! Selamat datang di Bot Store.\nSilakan pilih menu di bawah:`,
            buttons: [
                { buttonId: '#store', buttonText: { displayText: '🛍️ Menu Store' }, type: 1 },
                { buttonId: '#group', buttonText: { displayText: '👥 Menu Grup' }, type: 1 },
                { buttonId: '#owner', buttonText: { displayText: '👑 Menu Owner' }, type: 1 }
            ]
        }, { quoted: msg });
    }
};
