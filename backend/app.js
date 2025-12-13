const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
//const sweetRoutes = require('./routes/sweetRoutes');

const app = express();

// Middleware
app.use(cors());              // Allows Frontend to talk to Backend
app.use(express.json());      // Accepts JSON requests from the client

app.use('/api/auth', authRoutes);
//app.use('/api/sweets', sweetRoutes);
app.get('/', (req, res) => {
  res.send('Sweet Shop API is running!');
});

module.exports = app; // Export for testing and server.js