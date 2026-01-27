const User = require('../models/User');
const fernet = require('fernet');
require('dotenv').config();

const secret = new fernet.Secret(process.env.MESSAGE_SECRET_KEY);


// @desc    Get user details
// @route   GET /get-details
// @access  Public
const getUserDetails = async (req, res) => {
    try {
        const email = req.query.email;
        const user = await User.findOne({ email }).select('-password'); // Exclude password

        if (user) {
            // Decrypt messages before sending
            const decryptedMessages = user.messages.map(msg => {
                try {
                    const token = new fernet.Token({ secret: secret, token: msg.content, ttl: 0 });
                    return {
                        ...msg.toObject(),
                        content: token.decode()
                    };
                } catch (err) {
                    console.error("Decryption error for message:", msg._id, err);
                    return {
                        ...msg.toObject(),
                        content: "[Encrypted Message]"
                    };
                }
            });

            const userObj = user.toObject();
            userObj.messages = decryptedMessages;
            res.json(userObj);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// @desc    Send message to user
// @route   POST /send-message/:username
// @access  Public
const sendMessage = async (req, res) => {
    const recipientUsername = req.params.username;
    const { content } = req.body;

    try {
        const recipientUser = await User.findOne({ username: recipientUsername });

        if (!recipientUser) {
            return res.status(404).json({ message: 'Recipient user not found' });
        }

        // Encrypt message content
        const token = new fernet.Token({ secret: secret });
        const encryptedContent = token.encode(content);

        const newMessage = {
            content: encryptedContent,
        };

        recipientUser.messages.push(newMessage);
        await recipientUser.save();

        res.status(200).json({ message: 'Message sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @desc    Check if user exists
// @route   GET /check-user/:username
// @access  Public
const checkUser = async (req, res) => {
    const recipientUsername = req.params.username;
    try {
        const recipientUser = await User.findOne({ username: recipientUsername });
        if (!recipientUser) {
            return res.status(404).json({ status: false });
        }
        return res.status(200).json({ status: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { getUserDetails, sendMessage, checkUser };
