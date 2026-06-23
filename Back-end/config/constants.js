/**
 * constants.js
 * Tập trung toàn bộ hằng số dùng chung trong dự án.
 * Lý do: Khi cần đổi tên folder/status, chỉ cần sửa ở đây — không phải tìm khắp nơi.
 */

// Các trạng thái hợp lệ của Video trong database
const VIDEO_STATUS = {
    PENDING_UPLOAD: 'PENDING_UPLOAD',
    UPLOADING: 'UPLOADING',
    PROCESSING: 'PROCESSING',
    READY: 'READY',
    FAILED: 'FAILED',
};

// Các prefix thư mục (folder) trên Cloudflare R2
const R2_FOLDERS = {
    RAW: 'videos',
    PROCESSED: 'processed',
    SHORTS: 'shorts',
    THUMBNAILS: 'thumbnails',
};

// Thư mục tạm trên server để FFmpeg làm việc
const TMP_DIR = 'tmp';

module.exports = {
    VIDEO_STATUS,
    R2_FOLDERS,
    TMP_DIR,
};
