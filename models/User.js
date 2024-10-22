const mongoose = require ('mongoose');
const bcrypt = require('bcryptjs');

// Define user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['professor'] },

}, { timestamps: true });


userSchema.pre('save', async function(next){
    this.password = await bcrypt.hash(this.password, 10 );
    next();
});

userSchema.method.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

// Create user model
const User = mongoose.model('User', userSchema);

module.exports = User;