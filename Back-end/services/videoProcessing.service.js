/**
 * videoProcessing.service.js
 * Service orchestrate (điều phối) toàn bộ pipeline xử lý video:
 *   Download từ R2 → FFmpeg (nén/cắt/thumbnail) → Upload lên R2 → Dọn dẹp tmp
 *
 * Lý do tách riêng ra đây (KISS):
 *   Controller chỉ cần gọi một hàm duy nhất và nhận về kết quả.
 *   Mọi chi tiết kỹ thuật được ẩn hoàn toàn vào đây.
 */

const path = require('path');
const fs = require('fs');

const { downloadFileFromR2, uploadLocalFileToR2 } = require('./r2.service');
const { compressVideo, generateThumbnail, generateShortClip } = require('./ffmpeg.service');
const { R2_FOLDERS, TMP_DIR } = require('../config/constants');

/**
 * Thực hiện toàn bộ pipeline xử lý một file video từ R2.
 *
 * @param {string} r2Key - Đường dẫn file thô trên R2 (ví dụ: 'videos/1234-my_video.mp4')
 * @returns {Promise<{processedKey: string, shortKey: string, thumbnailKey: string}>}
 */
const processVideoJob = async (r2Key) => {
    // --- Bước 1: Chuẩn bị đường dẫn file tạm ---
    const baseName = path.basename(r2Key, path.extname(r2Key));
    const tmpDir = path.resolve(TMP_DIR);

    const localPaths = {
        raw: path.join(tmpDir, `${baseName}_raw.mp4`),
        compressed: path.join(tmpDir, `${baseName}_compressed.mp4`),
        short: path.join(tmpDir, `${baseName}_short.mp4`),
        thumbnailName: `${baseName}_thumb.jpg`,
    };
    localPaths.thumbnail = path.join(tmpDir, localPaths.thumbnailName);

    // --- Bước 2: Tải file thô từ R2 về thư mục tạm ---
    await downloadFileFromR2(r2Key, localPaths.raw);

    // --- Bước 3: FFmpeg xử lý cả 3 tác vụ ---
    await compressVideo(localPaths.raw, localPaths.compressed);
    await generateShortClip(localPaths.raw, localPaths.short);
    await generateThumbnail(localPaths.raw, tmpDir, localPaths.thumbnailName);

    // --- Bước 4: Upload 3 thành phẩm lên R2 (dùng constant thay vì hardcode) ---
    const r2Keys = {
        processed: `${R2_FOLDERS.PROCESSED}/${baseName}.mp4`,
        short: `${R2_FOLDERS.SHORTS}/${baseName}.mp4`,
        thumbnail: `${R2_FOLDERS.THUMBNAILS}/${baseName}.jpg`,
    };

    await uploadLocalFileToR2(localPaths.compressed, r2Keys.processed, 'video/mp4');
    await uploadLocalFileToR2(localPaths.short, r2Keys.short, 'video/mp4');
    await uploadLocalFileToR2(localPaths.thumbnail, r2Keys.thumbnail, 'image/jpeg');

    // --- Bước 5: Dọn dẹp file tạm để giải phóng ổ cứng ---
    [localPaths.raw, localPaths.compressed, localPaths.short, localPaths.thumbnail].forEach(
        (filePath) => fs.existsSync(filePath) && fs.unlinkSync(filePath)
    );

    // --- Bước 6: Trả về các R2 Key kết quả cho Controller ---
    return r2Keys;
};

module.exports = { processVideoJob };
