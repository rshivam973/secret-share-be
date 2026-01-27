const express = require('express');
const router = express.Router();
const { getUserDetails, sendMessage, checkUser } = require('../controllers/userController');

router.get('/get-details', getUserDetails);
router.post('/send-message/:username', sendMessage);
router.get('/check-user/:username', checkUser);

module.exports = router;
