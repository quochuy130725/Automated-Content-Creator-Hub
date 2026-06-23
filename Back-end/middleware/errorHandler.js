/**
 * errorHandler.js
 * Middleware xử lý lỗi tập trung cho toàn bộ ứng dụng Express.
 *
 * Cách dùng trong Controller:
 *   - Thay vì tự viết try/catch, chỉ cần `next(error)`.
 *   - Express sẽ tự động chuyển lỗi đến đây.
 *
 * Lưu ý: Middleware này PHẢI được gắn CUỐI CÙNG trong server.js (sau tất cả routes).
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    // Log lỗi ra server console để developer theo dõi
    console.error(`[ERROR] ${req.method} ${req.originalUrl} —`, err.message);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Lỗi hệ thống nội bộ';

    return res.status(statusCode).json({
        success: false,
        message,
        // Chỉ hiện chi tiết lỗi khi đang ở môi trường development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
