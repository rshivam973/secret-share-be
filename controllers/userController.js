const User = require('../models/User');
const Message = require('../models/Message');
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
            res.json(user);
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
    const { content, senderName } = req.body;

    try {
        const recipientUser = await User.findOne({ username: recipientUsername });

        if (!recipientUser) {
            return res.status(404).json({ message: 'Recipient user not found' });
        }

        // Encrypt message content
        const token = new fernet.Token({ secret: secret });
        const encryptedContent = token.encode(content);

        // Create new message document in Message collection
        const newMessage = new Message({
            recipient: recipientUser._id,
            senderName: senderName || 'Anonymous',
            content: encryptedContent
        });

        await newMessage.save();

        res.status(200).json({ message: 'Message sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @desc    Get current user details
// @route   GET /me
// @access  Protected
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select('-password'); // Exclude password

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
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

// @desc    Get user's messages with pagination
// @route   GET /messages?page=1&pageSize=10
// @access  Protected
const getUserMessages = async (req, res) => {
    try {
        const userId = req.userId;

        // Get pagination params from query, set defaults
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        // Validate pagination params
        const currentPage = page < 1 ? 1 : page;
        const itemsPerPage = pageSize < 1 ? 10 : pageSize;

        // Get total count of messages for this user
        const totalCount = await Message.countDocuments({ recipient: userId });

        // Calculate pagination values
        const totalPages = Math.ceil(totalCount / itemsPerPage);
        const skip = (currentPage - 1) * itemsPerPage;

        // Fetch paginated messages for the authenticated user
        const messages = await Message.find({ recipient: userId })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(itemsPerPage)
            .select('-__v');

        // Decrypt messages before sending
        const decryptedMessages = messages.map(msg => {
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

        res.json({
            messages: decryptedMessages,
            pagination: {
                totalCount: totalCount,
                currentPage: currentPage,
                totalPages: totalPages,
                itemsPerPage: itemsPerPage,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { getUserDetails, sendMessage, checkUser, getCurrentUser, getUserMessages };
