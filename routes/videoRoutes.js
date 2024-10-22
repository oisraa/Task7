const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const Course = require('../models/Course');  // Adjust path as needed
const { auth: authMiddleware, professorOnly } = require('../middleware/auth');

// videoRoutes
        router.post('/:courseId/videos', authMiddleware, professorOnly, async (req, res) => {
        try {
        const { title, description, videoUrl } = req.body;

        // Create a new video
        const video = new Video({ title, description, videoUrl, course: req.params.courseId });
        await video.save();

        // Find the course by ID
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Add the video ID to the course's videos array
        course.videos.push(video._id);
        await course.save();

        res.status(201).json({ message: 'Video added successfully', video });
        } catch (error) {
        res.status(400).json({ error: error.message });
       }
        });


// Get all videos for a course
      router.get('/courses/:courseId/videos', authMiddleware, async (req, res) => {
      try {
        const videos = await Video.find({ course: req.params.courseId });
        res.status(200).json(videos);
       } catch (error) {
        res.status(500).json({ error: error.message });
       }
       });

// Get a single video by ID
       router.get('/videos/:id', authMiddleware, async (req, res) => {
        try {
        const video = await Video.findById(req.params.id).populate('course', 'title');
        if (!video) return res.status(404).json({ message: 'Video not found' });
        res.status(200).json(video);
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
        });

// Update a video (Only the professor who uploaded it)
        router.put('/videos/:id', authMiddleware, professorOnly, async (req, res) => {
        try {
        const video = await Video.findById(req.params.id);
        if (!video || video.course.professor.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'video not found or you do not have permission to modify this video' });
        }

        const updates = Object.keys(req.body);
        updates.forEach(update => video[update] = req.body[update]);

        await video.save();
        res.status(200).json({ message: 'Video updated successfully', video });
        } catch (error) {
        res.status(400).json({ error: error.message });
        }
        });

// Delete a video (Only the professor who uploaded it)
        router.delete('/videos/:id', authMiddleware, professorOnly, async (req, res) => {
        try {
        const video = await Video.findByIdAndDelete({ _id: req.params.id });
        if (!video) return res.status(404).json({ message: 'video not found or you do not have permission to modify this video' });
        res.status(200).json({ message: 'Video deleted successfully' });
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
        }); 

// Add a comment to a video
       router.post('/videos/:id/comments', authMiddleware, async (req, res) => {
       try {
        const { comment } = req.body;
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        video.comments.push({
            user: req.user._id,
            content: comment
        });

        await video.save();
        res.status(201).json({ message: 'Comment added successfully', video });
       } catch (error) {
        res.status(400).json({ error: error.message });
       }
       });

       module.exports = router;
