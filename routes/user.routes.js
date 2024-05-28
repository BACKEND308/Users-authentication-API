const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // For JWT authentication
const nodemailer = require('nodemailer'); // For sending emails
const crypto = require('crypto'); // For generating tokens

const router = express.Router();

//GET request to check if email exists
router.get('/check-email', async (req, res) => {
    const { email } = req.query;
    try {
        const user = await User.findOne({ email });
        if (user) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
});

//GET request to check the type of user given an email
router.get('/check-type/:email', async (req, res) => {
    const email = req.params.email;
    try {
        const user = await User.findOne({email});
        if (user) {
            return res.status(200).json({ type: user.type });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
});

// Password hashing function using a salt of 12 rounds
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

// Password comparison function
async function checkPassword(plainPassword, hashedPassword) {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
}

//POST request to register a new user
router.post('/register', async (req, res) => {
    const { type='passenger', email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide an email and password' });
    }
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await hashPassword(password);
        user = new User({
            type,
            email,
            password : hashedPassword
        });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
});

//POST request to login a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password) {
        return res.status(400).json({ message: 'Please provide an email and password' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordMatch = await checkPassword(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const token = jwt.sign({ _id: user._id, email: user.email, type: user.type }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error: ', error });
    }
});

//DELETE request to delete a user
router.delete('/delete/:email', async (req, res) => {
    const email = req.params.email;
    try {
        const user = await User.findOneAndDelete({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }       
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error: ', error});
    }
});

module.exports = router;
