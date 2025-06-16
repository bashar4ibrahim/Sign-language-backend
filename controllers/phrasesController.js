// controllers/phrasesController.js
const db = require('../models/db');

// Get all phrases for a user
exports.getPhrases = async (req, res) => {
 const { userId } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM emergency_phrases WHERE user_id = $1 ORDER BY id DESC',
      [userId]
    );

    // Instead of sending 404, just return an empty array if no phrases
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching phrases:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add new phrase
exports.addPhrase = async (req, res) => {
  const userId = req.params.userId;
  const { text } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO emergency_phrases (user_id, text) VALUES ($1, $2) RETURNING *',
      [userId, text]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add phrase' });
  }
};

// Delete phrase
exports.deletePhrase = async (req, res) => {
  const phraseId = req.params.id;
  try {
    await db.query('DELETE FROM emergency_phrases WHERE id = $1', [phraseId]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete phrase' });
  }
};
