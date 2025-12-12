const config = require('../config');
const fs = require('fs');

module.exports = {
    sendAdminMenu: async (sock, sender, msg) => {
        const thumb = fs.readFileSync(config.thumb);
        const adminMenuText = `
──────────────────────────────
│            MENU ADMIN
──────────────────────────────
• Open / Close Grup
• Promote / Demote Member
• Kick Member
• Tag All
• Set Subject
• Set Description
• Set Rules
• Set Slowmode
• Anti Link (On/Off)
• Anti Virtex (On/Off)
• Anti Toxic (On/Off)
• Anti Spam (On/Off)
• View Group Info
• Reset Setting Grup
`;
        await sock.sendMessage(sender, {
            image: thumb,
            caption: adminMenuText,
            buttons: [
                { buttonId: '#menu', buttonText: { displayText: '📋 Kembali ke Menu' }, type: 1 }
            ]
        }, { quoted: msg });
    }
};
