require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const locationRouter = require('./routes/locationRoutes'); // Adjust the path as necessary

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

// Use the location router
app.use(locationRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Location service running on port ${PORT}`);
});
