const config = require('../config');
const fs = require('fs');

module.exports = {
    sendStoreMenu: async (sock, sender, msg) => {
        const thumb = fs.readFileSync(config.thumb);
        const banner = fs.readFileSync(config.storeBanner);
        let productList = 'LIST PRODUCT:\n';
        config.products.forEach((product, index) => {
            productList += `[${product.id}]. ${product.name} (${product.stock})\n`;
        });
        await sock.sendMessage(sender, {
            image: banner,
            caption: productList,
            buttons: [
                { buttonId: '#order', buttonText: { displayText: '🛒 Order Produk' }, type: 1 },
                { buttonId: '#menu', buttonText: { displayText: '📋 Kembali ke Menu' }, type: 1 }
            ]
        }, { quoted: msg });
    }
};
