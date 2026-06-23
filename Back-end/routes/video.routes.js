const express = require('express');
const router = express.Router();
const { uploadVideoIntent } = require('../controllers/video.controller.js');

// Định nghĩa endpoint /api/videos/upload
router.post('/upload', uploadVideoIntent);

module.exports = router;
