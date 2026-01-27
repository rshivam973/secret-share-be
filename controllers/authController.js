const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');


// @desc    Register a new user
// @route   POST /register
// @access  Public
const registerUser = async (req, res) => {
    const { Name, username, email, password, confirmPassword } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username: username }, { email: email }] });

        if (existingUser) {
            return res.status(409).json({ message: 'Username or email already exists' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Password hashing is handled in User model pre-save hook
        const newUser = new User({
            Name,
            username,
            email,
            password,
            // confirmPassword is intentionally not saved
        });

        await newUser.save();

        res.status(200).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @desc    Auth user & get JWT tokens
// @route   POST /login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Generate tokens
            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            res.status(200).json({
                message: 'Login successful',
                access_token: accessToken,
                refresh_token: refreshToken
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @desc    Refresh access token
// @route   POST /refresh-token
// @access  Public
const refreshToken = async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(400).json({ message: 'Refresh token required' });
    }

    try {
        const { verifyRefreshToken } = require('../utils/tokenUtils');
        const decoded = verifyRefreshToken(refresh_token);

        // Generate new access token
        const newAccessToken = generateAccessToken(decoded.userId);

        res.status(200).json({
            access_token: newAccessToken
        });
    } catch (error) {
        res.status(401).json({ message: error.message || 'Invalid or expired refresh token' });
    }
};

module.exports = { registerUser, loginUser, refreshToken };
