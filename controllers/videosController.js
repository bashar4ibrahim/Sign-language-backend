const db = require('../models/db');

// GET all users
exports.getAllVideosInCategory = async (req, res) => {
   const { categoryId } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM videos WHERE category_id = $1',
      [categoryId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
