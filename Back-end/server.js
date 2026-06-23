const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load các biến môi trường từ file .env
dotenv.config();

// Khởi tạo kết nối đến MongoDB Atlas
connectDB();

const app = express();

// Middleware để Express hiểu định dạng JSON trong Request Body
app.use(express.json());

// Khai báo và gắn Routes
app.use('/api/videos', require('./routes/video.routes'));

// Endpoint mặc định để kiểm tra server
app.get('/', (req, res) => {
    res.json({ success: true, message: 'Automated Content Creator Hub API is running...' });
});

// Gắn Centralized Error Handler — PHẢI đặt CUỐI CÙNG, sau tất cả routes
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});
