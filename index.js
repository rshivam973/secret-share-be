//jshint esversion:6
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const PORT = process.env.PORT || 5000;

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/', authRoutes);
app.use('/', userRoutes);


app.listen(PORT, () => {
  console.log(`Backend started at port ${PORT}`);

  // Start keep-alive pinging after server is ready
  require('./utils/keepAlive');
});

