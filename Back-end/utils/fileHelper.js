/**
 * fileHelper.js
 * Các hàm tiện ích để xử lý tên file.
 */

const { R2_FOLDERS } = require('../config/constants');

/**
 * Sinh một R2 Key (đường dẫn) độc nhất, an toàn cho tên file.
 * Kết hợp timestamp + tên được làm sạch để tránh xung đột và ký tự đặc biệt.
 *
 * @param {string} title - Tiêu đề gốc của video (có thể chứa ký tự đặc biệt, tiếng Việt)
 * @param {string} folder - Thư mục đích trên R2 (dùng R2_FOLDERS constant)
 * @param {string} ext - Phần mở rộng file, ví dụ: 'mp4', 'jpg'
 * @returns {string} R2 Key, ví dụ: 'videos/1782236193317-my_video.mp4'
 */
const generateUniqueFileName = (title, folder = R2_FOLDERS.RAW, ext = 'mp4') => {
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${folder}/${Date.now()}-${cleanTitle}.${ext}`;
};

module.exports = { generateUniqueFileName };
