const db = require('../models/db');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// GET all users
exports.getAllUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET a user by ID
exports.getUserById = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST create a new user
exports.createUser = async (req, res) => {
  console.log('[POST /users] Incoming user:', req.body);
 const {
  username, email, password_hash, full_name,
  profile_image_url, bio, title, followers,
  following, posts, location, joined_date, auth0_id
} = req.body;
  try {
    const result = await db.query(
  `INSERT INTO users 
   (username, email, password, full_name, profile_image_url, bio, title, followers, following, posts, location, joined_date, auth0_id)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
   RETURNING *`,
  [username, email, password_hash, full_name, profile_image_url, bio, title, followers, following, posts, location, joined_date, auth0_id]
);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT update a user
exports.updateUser = async (req, res) => {
  const { username, email, bio, title, location } = req.body;

  try {
    const result = await db.query(
      `UPDATE users SET 
        username = $1,
        email = $2,
        bio = $3,
        title = $4,
        location = $5
       WHERE id = $6
       RETURNING *`,
      [username, email, bio, title, location, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ 
      error: error.message,
      details: 'Failed to update user profile' 
    });
  }
};

 

// DELETE a user
exports.deleteUser = async (req, res) => {
  try {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






// Configure storage
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  })
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'imageType', maxCount: 1 }
]);
exports.updateImage = async (req, res) => {
  console.log('Starting image upload...');

  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ 
        success: false,
        message: err.message 
      });
    }

    const userId = req.params.userId;
    const imageType = req.body.imageType || 'profile_image';

    console.log(`User ID: ${userId}, Image Type: ${imageType}`);

    // Check for uploaded image
    const uploadedImage = req.files?.image?.[0];
    if (!uploadedImage) {
      console.error('No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('File received:', uploadedImage);

    try {
      // Get current image
      const currentImage = await db.query(
        `SELECT ${imageType} FROM users WHERE id = $1`,
        [userId]
      );

      // Update database
      const result = await db.query(
        `UPDATE users SET ${imageType} = $1 WHERE id = $2 RETURNING *`,
        [uploadedImage.filename, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Delete old image
      const oldImageFilename = currentImage.rows[0]?.[imageType];
      if (oldImageFilename) {
        const oldImagePath = path.join(__dirname, '../uploads', oldImageFilename);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log('Old image deleted successfully');
        }
      }

      console.log('Image update complete');
      res.status(200).json({
        success: true,
        message: 'Image updated successfully',
        image: uploadedImage.filename
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({
        success: false,
        message: 'Database operation failed'
      });
    }
  });
};

// Combined profile update handler
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.id;
    const { bio } = req.body;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    let profileImage = null;
    let middleImage = null;

    // Handle file uploads if present
    if (req.file) {
      profileImage = req.file.filename;
    }

    // Update database
    const result = await db.query(
      `UPDATE users 
       SET bio = COALESCE($1, bio),
           profile_image_url = COALESCE($2, profile_image),
           middle_image = COALESCE($3, middle_image)
       WHERE id = $4
       RETURNING *`,
      [bio || null, profileImage, middleImage, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// New handler for profile image
exports.getProfileImage = async (req, res) => {
  await getImageByType(req, res, 'profile_image');
};

// New handler for middle image
exports.getMiddleImage = async (req, res) => {
  await getImageByType(req, res, 'middle_image');
};

// Shared image retrieval function
const getImageByType = async (req, res, imageType) => {
  try {
    const { userId } = req.params;

    // Get the image filename from database
    const result = await db.query(
      `SELECT ${imageType} FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0 || !result.rows[0][imageType]) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const imageName = result.rows[0][imageType];
    const imagePath = path.join(__dirname, '../uploads', imageName);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image file not found'
      });
    }

    // Send the image file
    res.sendFile(imagePath);

  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;

    const result = await db.query(`
      SELECT v.category_id, uvp.video_id
      FROM user_video_progress uvp
      JOIN videos v ON uvp.video_id = v.id
      WHERE uvp.user_id = $1
    `, [userId]);

    const progressMap = {};

    result.rows.forEach(({ category_id, video_id }) => {
      if (!progressMap[category_id]) {
        progressMap[category_id] = [];
      }
      progressMap[category_id].push(video_id);
    });

    res.status(200).json(progressMap);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ message: 'Server error fetching progress' });
  }
};


// @desc    Update user progress
// @route   POST /api/progress/:userId/:videoId
exports.updateUserProgress = async (req, res) => {
  try {
    const { userId, videoId } = req.params;
   console.log("hi from inside")
    // Check if already marked as completed
    const existing = await db.query(
      'SELECT * FROM user_video_progress WHERE user_id = $1 AND video_id = $2',
      [userId, videoId]
    );

    if (existing.rows.length === 0) {
      await db.query(
        'INSERT INTO user_video_progress (user_id, video_id, completed_at) VALUES ($1, $2, NOW())',
        [userId, videoId]
      );

      return res.status(200).json({
        success: true,
        message: 'Progress updated successfully',
        isNewCompletion: true
      });
    }

    res.status(200).json({
      success: true,
      message: 'Video already marked as completed',
      isNewCompletion: false
    });

  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating progress'
    });
  }
};



