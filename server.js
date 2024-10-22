const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const videoRoutes = require('./routes/videoRoutes');
dotenv.config();
const app = express(); // Initialize the app
const courseRoutes = require('./routes/courseRoutes');
const userRoutes = require ('./routes/userRoutes')
// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log('Connected to MongoDB');

        // Start the server only after the connection to MongoDB is successful
        const PORT = process.env.PORT || 9091;
        app.listen(PORT, () => {
            console.log(`Server is listening on port http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

// Use course routes
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);    // Routes for video and comment management