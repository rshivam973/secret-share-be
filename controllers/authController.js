const User = require('../models/User');

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

// @desc    Auth user & get token (No token implementation yet, just login)
// @route   POST /login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.status(200).json({
                message: 'Login successful', user: {
                    _id: user._id,
                    Name: user.Name,
                    username: user.username,
                    email: user.email
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { registerUser, loginUser };
