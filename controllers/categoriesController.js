// In your categories controller file (e.g., categoriesController.js)
const db = require('../models/db');

// GET all categories with video counts
exports.getAllCategories = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.*,
        COUNT(v.id) as video_count
      FROM 
        categories c
      LEFT JOIN 
        videos v ON c.id = v.category_id
      GROUP BY 
        c.id
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET all videos in category (keep your existing implementation)
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