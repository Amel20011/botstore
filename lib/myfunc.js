const fs = require('fs');
const axios = require('axios');
const { fromBuffer } = require('file-type');

module.exports = {
    smsg: (conn, m, store) => {
        if (!m) return m;
        let M = m.constructor ? m : m.messages[0];
        if (M.key.remoteJid === 'status@broadcast') return;
        if (!M) return M;
        if (m.type === 'protocolMessage' || m.type === 'senderKeyDistributionMessage' || !m.message) return;
        const text = m.message.conversation || m.message[Object.keys(m.message)[0]]?.text || '';
        return {
            text,
            ...m
        };
    },
    isUrl: (url) => {
        return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'));
    },
    generateMessageTag: (epoch) => {
        let tag = (0, exports.generateRandomBytes)(5).toString('hex');
        return `${tag}-${epoch}`;
    },
    getBuffer: async (url, options) => {
        try {
            const res = await axios({
                method: 'get',
                url,
                headers: {
                    'DNT': 1,
                    'Upgrade-Insecure-Request': 1
                },
                ...options,
                responseType: 'arraybuffer'
            });
            return res.data;
        } catch (err) {
            return err;
        }
    },
    getSizeMedia: (path) => {
        return new Promise((resolve, reject) => {
            if (fs.existsSync(path)) {
                fs.stat(path, (err, stats) => {
                    if (err) reject(err);
                    resolve(stats.size);
                });
            } else {
                reject('File not found');
            }
        });
    },
    fetchJson: async (url, options) => {
        try {
            const res = await axios({
                method: 'GET',
                url: url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
                },
                ...options
            });
            return res.data;
        } catch (err) {
            return err;
        }
    },
    runtime: (seconds) => {
        seconds = Number(seconds);
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor(seconds % (3600 * 24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);
        const dDisplay = d > 0 ? d + (d === 1 ? ' day, ' : ' days, ') : '';
        const hDisplay = h > 0 ? h + (h === 1 ? ' hour, ' : ' hours, ') : '';
        const mDisplay = m > 0 ? m + (m === 1 ? ' minute, ' : ' minutes, ') : '';
        const sDisplay = s > 0 ? s + (s === 1 ? ' second' : ' seconds') : '';
        return dDisplay + hDisplay + mDisplay + sDisplay;
    },
    clockString: (ms) => {
        const h = Math.floor(ms / 3600000);
        const m = Math.floor(ms / 60000) % 60;
        const s = Math.floor(ms / 1000) % 60;
        return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
    }
};
