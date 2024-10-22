const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { auth: authMiddleware, professorOnly } = require('../middleware/auth');
const Video = require('../models/Video'); // Adjust the path based on your folder structure
const { validateDuration } = require('../utils/validators');  // Import the validator

router.post('/', authMiddleware, professorOnly, async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        console.log('User:', req.user);

        const { title, description, duration, videos } = req.body;
        // Validate the duration format before saving the course
        if (!validateDuration(duration)) {
            return res.status(400).json({ message: 'Invalid duration format! Format must be hh:mm:ss.' });
        }
        // Create the Course
        const course = new Course({
            title,
            description,
            duration,
            professor: req.user._id
        });

        // Save the course
        const savedCourse = await course.save();
        console.log('Course saved successfully:', savedCourse);

        // If there are videos, save them and associate them with the course
        const savedVideos = [];
        if (videos && videos.length > 0) {
            for (let videoData of videos) {
                const newVideo = new Video({
                    ...videoData,
                    course: savedCourse._id // Link the video to the course
                });
                const savedVideo = await newVideo.save();
                savedVideos.push(savedVideo);
            }
            console.log('Videos saved successfully:', savedVideos);
        }

        // Respond with the course and associated videos
        res.status(201).json({ 
            message: 'Course created successfully', 
            course: savedCourse, 
            videos: savedVideos 
        });
    } catch (error) {
        console.error('Error saving course:', error); // Log error details
        res.status(400).json({ error: error.message });
    }
});


// Get all courses (For both users and professors)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const courses = await Course.find().populate('professor', 'name');
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific course by ID
router.get('/courses/:id', authMiddleware, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('professor', 'name');
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a course (Only the professor who created it)
router.put('/courses/:id', authMiddleware, professorOnly, async (req, res) => {
    
    const { duration } = req.body;
    // Validate duration format
    if (duration && !validateDuration(duration)) {
        return res.status(400).json({ message: 'Invalid duration format! Format must be hh:mm:ss.' });
    }

    try {
        const course = await Course.findOne({ _id: req.params.id, professor: req.user._id });
       
        // Add the improved error message
        if (!course) return res.status(404).json({ message: 'Course not found or you do not have permission to modify this course' });

        const updates = Object.keys(req.body);
        updates.forEach(update => course[update] = req.body[update]);

        await course.save();
        res.status(200).json({ message: 'Course updated successfully', course });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a course (Only the professor who created it)
router.delete('/courses/:id', authMiddleware, professorOnly, async (req, res) => {
    try {
        const course = await Course.findOneAndDelete({ _id: req.params.id, professor: req.user._id });
      
        // Add the improved error message
        if (!course) return res.status(404).json({ message: 'Course not found or you do not have permission to modify this course' });
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
