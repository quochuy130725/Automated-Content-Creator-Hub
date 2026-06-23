const mongoose = require('mongoose');
const { VIDEO_STATUS } = require('../config/constants');

const videoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Vui lòng cung cấp tiêu đề video'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: Object.values(VIDEO_STATUS),
            default: VIDEO_STATUS.PENDING_UPLOAD,
        },
        // Đường dẫn file thô trên Cloudflare R2 (key sau khi upload ban đầu)
        rawVideoKey: { type: String },

        // Các đường dẫn thành phẩm sau khi FFmpeg xử lý xong
        processedVideoUrl: { type: String },
        shortClipUrl:      { type: String },
        thumbnailUrl:      { type: String },
    },
    {
        timestamps: true, // Tự động thêm createdAt và updatedAt
    }
);

module.exports = mongoose.model('Video', videoSchema);
