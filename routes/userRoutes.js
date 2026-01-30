const express = require('express');
const router = express.Router();
const { getUserDetails, sendMessage, checkUser, getCurrentUser, getUserMessages } = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/get-details', getUserDetails);
router.post('/send-message/:username', sendMessage);
router.get('/check-user/:username', checkUser);
router.get('/me', authenticate, getCurrentUser);
router.get('/messages', authenticate, getUserMessages);

module.exports = router;
