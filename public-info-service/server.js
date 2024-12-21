// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const announcementRoutes = require('./routes/announcementRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON bodies

app.use('/api/announcements', announcementRoutes); // Announcement routes

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`Public Information and Announcements service running on port ${PORT}`);
});
