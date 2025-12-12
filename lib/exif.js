const fs = require('fs');
const { exec } = require('child_process');
const { fromBuffer } = require('file-type');

module.exports = {
    imageToWebp: async (image) => {
        const tempPath = './temp/image.jpg';
        const webpPath = './temp/image.webp';
        fs.writeFileSync(tempPath, image);
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${tempPath} ${webpPath}`, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
        const webpBuffer = fs.readFileSync(webpPath);
        fs.unlinkSync(tempPath);
        fs.unlinkSync(webpPath);
        return webpBuffer;
    },
    videoToWebp: async (video) => {
        const tempPath = './temp/video.mp4';
        const webpPath = './temp/video.webp';
        fs.writeFileSync(tempPath, video);
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${tempPath} -vf scale=320:320 -c:v libwebp -lossless 0 -compression_level 3 -q:v 70 -loop 0 -preset default -an -vsync 0 ${webpPath}`, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
        const webpBuffer = fs.readFileSync(webpPath);
        fs.unlinkSync(tempPath);
        fs.unlinkSync(webpPath);
        return webpBuffer;
    },
    writeExifImg: async (image, metadata) => {
        const webp = await this.imageToWebp(image);
        // Tambahkan metadata jika diperlukan
        return webp;
    },
    writeExifVid: async (video, metadata) => {
        const webp = await this.videoToWebp(video);
        // Tambahkan metadata jika diperlukan
        return webp;
    }
};
