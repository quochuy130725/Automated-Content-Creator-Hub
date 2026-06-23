const express = require('express');
const router = express.Router();
const { uploadVideoIntent, confirmUpload } = require('../controllers/video.controller.js');

// Định nghĩa endpoint /api/videos/upload
router.post('/upload', uploadVideoIntent);

// Định nghĩa endpoint /api/videos/confirm-upload
router.post('/confirm-upload', confirmUpload);

module.exports = router;
