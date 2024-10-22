const mongoose = require('mongoose');
const { Schema } = mongoose;  // Import Schema
const Video = require('./Video');  // Import the Video model

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/.test(v);
            },
            message: props => `${props.value} is not a valid duration! Format must be hh:mm:ss.`,
        },
    },
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],  // Store video IDs instead of the schema
    professor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
