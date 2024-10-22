const express = require ("express");
const User = require("../models/User");
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Make sure this line is present

    // Register a new user
    router.post("/register", async (req, res) => {
        try {
          const { name, email, password, age } = req.body;
          const existingUser = await User.findOne({ email: email });
          if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
          }
          // Create a new user
          const user = new User(req.body);
          await user.save();
          // Generate a JWT token
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
          });
          res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email },
          });
          } catch (error) {
            res.status(500).json({ message: error.message });
          }
        });

        // login
    router.post('/login', async (req, res) => {
            const { email, password } = req.body;
            try {
            if (!email || !password) {
            return res.status(400).json({ message: 'Please enter both email and password' });
              }

            const user = await User.findOne({ email });
             if (!user) {
             return res.status(400).json({ message: 'User not found' });
              }

              const isMatch = await bcrypt.compare(password, user.password);
              if (!isMatch) {
              return res.status(400).json({ message: 'Invalid credentials' });
              }

              const token = jwt.sign(
               { id: user._id },
               process.env.JWT_SECRET,
               { expiresIn: process.env.JWT_EXPIRES_IN }
              );

              return res.status(200).json({ token });
              } catch (error) {
              console.error('Login Error:', error);  // Add this line to log the error details
              res.status(500).json({ message: 'Server error', error: error.message });
              }
              });


              
         // Create a new user (POST)
     router.post("/", async (req, res) => {
                try {
                  const newUser = new User(req.body);
                  await newUser.save();
                  res.status(201).json(newUser);
                } catch (error) {
                  res.status(400).json({ message: error.message });
                }
              });
              
              // Get all users (GET)
     router.get("/", async (req, res) => {
                try {
                  const users = await User.find();
                  res.status(200).json(users);
                } catch (error) {
                  res.status(500).json({ message: error.message });
                }
              });
              
              // Get a user by ID (GET)
      router.get("/:id", async (req, res) => {
                try {
                  const { id } = req.params;
                  const user = await User.findById(id);
                  if (!user) {
                    return res.status(404).json({ message: "User not found" });
                  }
                  res.status(200).json(user);
                } catch (error) {
                  res.status(500).json({ message: error.message });
                }
              });
              
              // Update a user by ID (PUT)
       router.put("/:id", async (req, res) => {
                try {
                const user = await User.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
                  });
                if (!user) {
                return res.status(404).json({ message: "User not found" });
                  }
                res.status(200).json(user);
                } catch (error) {
                res.status(400).json({ message: error.message });
                }
              });
              
              // Delete a user by ID (DELETE)
      router.delete("/:id", async (req, res) => {
                try {
                const user = await User.findByIdAndDelete(req.params.id);
                if (!user) {
                return res.status(404).json({ message: "User not found" });
                  }
                  res.status(200).json({ message: "User deleted successfully" });
                 } catch (error) {
                  res.status(500).json({ message: error.message });
                }
              });
              
     module.exports = router;
              