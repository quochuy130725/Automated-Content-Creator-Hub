const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vui lòng cung cấp tiêu đề video']
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['PENDING_UPLOAD', 'UPLOADING', 'PROCESSING', 'READY', 'FAILED'],
        default: 'PENDING_UPLOAD'
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Video', videoSchema);
