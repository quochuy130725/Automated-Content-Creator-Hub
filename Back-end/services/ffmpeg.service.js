const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const path = require('path');

// Cấu hình đường dẫn lõi FFmpeg static
ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Nén video chuẩn H.264 (Ví dụ: scale về 720p để giảm dung lượng)
 */
const compressVideo = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .videoCodec('libx264')
            .size('1280x720') // Resize về 720p
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(err))
            .save(outputPath);
    });
};

/**
 * Chụp 1 ảnh thumbnail ở giây thứ 2
 */
const generateThumbnail = (inputPath, outputFolder, filename) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .on('end', () => resolve(path.join(outputFolder, filename)))
            .on('error', (err) => reject(err))
            .screenshots({
                timestamps: [2],
                folder: outputFolder,
                filename: filename,
                size: '1280x720'
            });
    });
};

/**
 * Cắt lấy đoạn video clip dài 15 giây đầu tiên
 */
const generateShortClip = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .setStartTime(0)
            .setDuration(15)
            .videoCodec('libx264')
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(err))
            .save(outputPath);
    });
};

module.exports = {
    compressVideo,
    generateThumbnail,
    generateShortClip
};
