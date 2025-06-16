const express = require('express');
const router = express.Router();
const multer = require('multer');

const usersController = require('../controllers/usersController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Image upload route
router.post(
  '/:userId/image',
   // Use the updated Multer config
  usersController.updateImage
);

// Profile update route (handles bio and images)
router.put(
  '/:userId/profile',
// Adjust based on your field name
  usersController.updateUserProfile
);


// Add this new route for image retrieval
router.get('/:userId/profile-image', usersController.getProfileImage);
router.get('/:userId/middle-image', usersController.getMiddleImage);

router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);
router.post('/', usersController.createUser);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

// Get progress per category for a user
router.get('/:userId/progress', usersController.getUserProgress);

// Mark a video as completed
router.post('/:userId/progress/:videoId', usersController.updateUserProgress);


module.exports = router;
