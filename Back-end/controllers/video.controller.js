/**
 * video.controller.js
 * Chỉ chịu trách nhiệm:
 *   1. Nhận và validate request
 *   2. Gọi service thực hiện business logic
 *   3. Trả response về client
 *
 * Mọi logic xử lý đã được tách vào services/ và utils/.
 * Lỗi được chuyển sang errorHandler middleware qua next(err) — không tự xử lý.
 */

const Video = require('../models/Video');
const { generateUploadUrl } = require('../services/r2.service');
const { processVideoJob } = require('../services/videoProcessing.service');
const { generateUniqueFileName } = require('../utils/fileHelper');
const { VIDEO_STATUS, R2_FOLDERS } = require('../config/constants');

/**
 * POST /api/videos/upload
 * Bước 1: Tạo metadata trong DB và trả về Presigned URL để client upload thẳng lên R2.
 */
exports.uploadVideoIntent = async (req, res, next) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền trường: title' });
        }

        // Sinh tên file R2 độc nhất — logic đã được đóng gói vào utils
        const rawVideoKey = generateUniqueFileName(title, R2_FOLDERS.RAW, 'mp4');
        const uploadUrl = await generateUploadUrl(rawVideoKey, 'video/mp4');

        // Lưu metadata vào DB — dùng các trường Schema chuẩn, không cần strict:false
        const newVideo = await Video.create({
            title,
            description,
            status: VIDEO_STATUS.PENDING_UPLOAD,
            rawVideoKey,
        });

        return res.status(201).json({
            success: true,
            message: 'Đã tạo link upload bảo mật. Vui lòng đẩy file lên uploadUrl.',
            data: {
                videoId: newVideo._id,
                status: newVideo.status,
                videoKey: rawVideoKey,
                uploadUrl,
            },
        });
    } catch (err) {
        next(err); // Chuyển lỗi sang errorHandler middleware
    }
};

/**
 * POST /api/videos/confirm-upload
 * Bước 2: Client báo upload xong → kích hoạt pipeline xử lý video tự động.
 */
exports.confirmUpload = async (req, res, next) => {
    const { videoId, r2Key } = req.body;

    if (!videoId || !r2Key) {
        return res.status(400).json({ success: false, message: 'Thiếu videoId hoặc r2Key' });
    }

    try {
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy video' });
        }

        // Chuyển trạng thái sang PROCESSING để client biết hệ thống đang xử lý
        video.status = VIDEO_STATUS.PROCESSING;
        await video.save();

        // Giao toàn bộ pipeline xử lý cho service — controller không cần biết chi tiết bên trong
        const { processed, short, thumbnail } = await processVideoJob(r2Key);

        // Cập nhật DB với kết quả thành phẩm — dùng trường Schema chuẩn
        video.status = VIDEO_STATUS.READY;
        video.processedVideoUrl = processed;
        video.shortClipUrl = short;
        video.thumbnailUrl = thumbnail;
        await video.save();

        return res.status(200).json({
            success: true,
            message: 'Video đã được xử lý và đóng gói thành công!',
            data: {
                videoId: video._id,
                status: video.status,
                processedVideoUrl: processed,
                shortClipUrl: short,
                thumbnailUrl: thumbnail,
            },
        });
    } catch (err) {
        // Nếu pipeline lỗi, đánh dấu FAILED trong DB rồi chuyển lỗi sang errorHandler
        await Video.findByIdAndUpdate(videoId, { status: VIDEO_STATUS.FAILED });
        next(err);
    }
};