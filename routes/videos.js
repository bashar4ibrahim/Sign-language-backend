const express = require('express');
const router = express.Router();

const videoController = require('../controllers/videosController');

router.get('/categories/:categoryId/videos', videoController.getAllVideosInCategory);

module.exports = router;