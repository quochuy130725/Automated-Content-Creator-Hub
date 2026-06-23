const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');
const { pipeline } = require('stream/promises');

// 1. Khởi tạo R2 Client (Dùng chuẩn tương thích S3 của AWS SDK v3)
const s3Client = new S3Client({
    region: 'auto', // Cloudflare R2 tự động định tuyến vùng
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

/**
 * Hàm sinh Presigned URL để Client (React Native/Postman) upload file thẳng lên R2 Bucket
 * @param {string} fileName - Tên file muốn lưu trên R2
 * @param {string} contentType - Kiểu file (ví dụ: video/mp4)
 * @returns {Promise<string>} - Trả về đường link Presigned URL bảo mật
 */
const generateUploadUrl = async (fileName, contentType) => {
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,         // Tên file độc nhất trên Cloud
        ContentType: contentType, // Ép kiểu định dạng file bảo mật
    });

    // Link này chỉ có hiệu lực trong vòng 5 phút (300 giây), quá hạn sẽ bị hủy để bảo mật
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    return presignedUrl;
};

/**
 * Tải file video thô từ Cloudflare R2 về thư mục tmp/ của Server
 */
const downloadFileFromR2 = async (r2Key, localFilePath) => {
    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: r2Key,
    });

    const response = await s3Client.send(command);
    
    // Đổ dữ liệu (stream) từ R2 vào file ở local
    await pipeline(response.Body, fs.createWriteStream(localFilePath));
    return localFilePath;
};

/**
 * Đẩy file thành phẩm (sau khi FFmpeg xử lý) từ Server ngược lên R2
 */
const uploadLocalFileToR2 = async (localFilePath, r2Key, contentType) => {
    const fileStream = fs.createReadStream(localFilePath);
    
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: r2Key,
        Body: fileStream,
        ContentType: contentType,
    });

    await s3Client.send(command);
    return r2Key;
};

module.exports = {
    generateUploadUrl,
    downloadFileFromR2,
    uploadLocalFileToR2
};