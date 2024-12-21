// src/app.js
const dotenv = require('dotenv'); // Load dotenv first
dotenv.config(); // Load environment variables
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const emailController = require('./emailController');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Define route for sending emails
app.post('/send-email', emailController.sendEmail);

// Start the server
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
    console.log(`Email service running on port ${PORT}`);
});
