const express = require('express');
const router = express.Router();
const phrasesController = require('../controllers/phrasesController');

// GET all phrases for a user
router.get('/:userId', phrasesController.getPhrases);

// POST new phrase for a user
router.post('/:userId', phrasesController.addPhrase);

// DELETE phrase by id
router.delete('/:id', phrasesController.deletePhrase);

module.exports = router;