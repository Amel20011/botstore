const config = require('../config');
const fs = require('fs');

module.exports = {
    sendGroupMenu: async (sock, sender, msg) => {
        const thumb = fs.readFileSync(config.thumb);
        const groupMenuText = `
──────────────────────────────
│           MENU GRUP
──────────────────────────────
1. GRUP PROTECTOR
   • Anti Link
   • Anti Toxic
   • Anti Spam
   • Anti Tag Everyone
   • Anti Tag Admin
   • Anti Promote / Demote
   • swgc/upswgc

2. PENGATURAN GRUP
   • Set Subject
   • Set Description
   • Set Rules
   • Set Slowmode
   • Lock / Unlock Grup
   • Open / Close Grup

3. WELCOME & LEAVE
   • Welcome Video (MP4)
   • Welcome Image
   • Custom Welcome Text
   • Leave Message
`;
        await sock.sendMessage(sender, {
            image: thumb,
            caption: groupMenuText,
            buttons: [
                { buttonId: '#menu', buttonText: { displayText: '📋 Kembali ke Menu' }, type: 1 }
            ]
        }, { quoted: msg });
    }
};
