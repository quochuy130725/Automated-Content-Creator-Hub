const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load các biến môi trường từ file .env
dotenv.config();

// Khởi tạo kết nối đến MongoDB Atlas
connectDB();

const app = express();

// Middleware để Express hiểu định dạng JSON trong Request Body
app.use(express.json());

// Khai báo các Routes
const videoRoutes = require('./routes/video.routes');

// Gắn Routes vào path /api/videos
app.use('/api/videos', videoRoutes);

// Endpoint mặc định để test server
app.get('/', (req, res) => {
    res.send('Automated Content Creator Hub API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});
