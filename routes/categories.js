const express = require('express');
const router = express.Router();

const categoriesController = require('../controllers/categoriesController');

router.get('/', categoriesController.getAllCategories);

module.exports = router;