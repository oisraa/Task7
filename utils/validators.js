// utils/validators.js
const validateDuration = (duration) => {
    const durationRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
    return durationRegex.test(duration);
};

module.exports = { validateDuration };
