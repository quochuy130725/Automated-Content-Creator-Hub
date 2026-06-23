const Video = require('../models/Video');
const { generateUploadUrl } = require('../services/r2.service.js');

exports.uploadVideoIntent = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền trường: title'
            });
        }

        // Mẹo Senior: Tạo tên file độc nhất trên R2 bằng cách băm chuỗi thời gian + tên viết liền
        const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const r2FileName = `videos/${Date.now()}-${cleanTitle}.mp4`;

        // 1. Gọi dịch vụ sinh Presigned URL từ Cloudflare R2 (mặc định định dạng video/mp4)
        const uploadUrl = await generateUploadUrl(r2FileName, 'video/mp4');

        // 2. Tạo bản ghi lưu vào MongoDB Atlas kèm đường dẫn file trên R2 (r2Key)
        const newVideo = new Video({
            title,
            description,
            status: 'PENDING_UPLOAD',
            // Bạn có thể bổ sung trường r2Key này vào Schema nếu muốn quản lý tên file, 
            // hoặc cứ để Mongoose tự lưu vì bản chất MongoDB cho phép thêm trường linh hoạt.
        });

        // Ép thêm thuộc tính động để lưu đường dẫn
        newVideo.set('videoUrlInStorage', r2FileName, { strict: false });

        const savedVideo = await newVideo.save();

        // 3. Trả về kết quả hoàn chỉnh cho Frontend
        return res.status(201).json({
            success: true,
            message: 'Đã tạo link upload bảo mật thành công. Vui lòng đẩy file lên uploadUrl.',
            data: {
                videoId: savedVideo._id,
                status: savedVideo.status,
                videoKey: r2FileName,
                uploadUrl: uploadUrl // <--- ĐÂY CHÍNH LÀ CHIẾC CHÌA KHÓA VÀNG
            }
        });

    } catch (error) {
        console.error('Lỗi tại controller uploadVideoIntent:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống nội bộ',
            error: error.message
        });
    }
};