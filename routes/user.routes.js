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

// Password hashing function using a salt of 10 rounds
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(12); // Generates a salt with 12 rounds
    const hashedPassword = await bcrypt.hash(password, salt); // Hashes the password with the salt
    return hashedPassword;
}

// Password comparison function
async function checkPassword(plainPassword, hashedPassword) {
    // bcrypt.compare handles the encoding internally
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
            console.log('Hashed password from database: "', user.password, '"');
            return res.status(400).json({ message: 'User already exists' });
        }
        // const salt = await bcrypt.genSalt(12); // Generates a salt with 12 rounds
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds); // Hashes the password with the salt
        user = new User({
            type,
            email,
            password : hashedPassword
        });
        // console.log('User object before save:', user);
        await user.save();
        // console.log('User registered successfully:', user);
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
            return res.status(401).json({ message: 'Invalid email or password1' });
        }
        // console.log('User found:', user); // This will show the user object if found

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isPasswordMatch); // This will show if the passwords match

        if (!isPasswordMatch) {
            // console.log('Stored hashed password:', user.password); // Log the stored hashed password
            // console.log('Input password:', password); // Log the input password
            // console.log('Hashed input password for comparison:', await bcrypt.hash(password, 12)); // Log the re-hashed input password for comparison
            return res.status(401).json({ message: 'Invalid email or password2' });
        }
        
        const token = jwt.sign({ _id: user._id, email: user.email }, 'secret key', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error: ', error });
    }
});


// //PATCH request to update a user's type to admin
// router.patch('/update-type/:email', async (req, res) => {
//     const { email } = req.params;
//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         } else {
//             user.type = 'admin';
//             await user.save();
//             res.status(200).json({ message: 'User type updated to admin' });
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: 'Server error: ', error});
//     }
// });

// //Middleware to authenticate and authorize admin users
// const authenticateAdmin = async (req, res, next) => {
//     try {
//         const token = req.header('Authorization').replace('Bearer ', '');
//         const decoded = jwt.verify(token, 'secret key');
//         const user = await User.findOne({ _id: decoded._id, email: decoded.email });
//         if (!user || user.type !== 'admin') {
//             throw new Error();
//         }
//         req.user = user;
//         next();
//     } catch (error) {
//         res.status(401).json({ message: 'Please authenticate and authorize' });
//     }
// };

// //Middleware to authenticate and authorize admin users through token
// router.get('/admin', authenticateAdmin, async (req, res) => {
//     res.status(200).json({ message: 'Admin user authenticated and authorized' });
// });

// Middleware to authenticate and authorize admin users
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied' });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });
      req.user = user;
      next();
    });
  };

  const authorizeAdmin = (req, res, next) => {
    if (req.user.type !== 'admin') return res.status(403).json({ message: 'Forbidden! Please authenticate and authorize' });
    next();
  };

// // Update user type to admin
// router.patch('/users/:id/:admin', authenticateToken, authorizeAdmin, async (req, res) => {
//     const { id, privilege } = req.params;
//     const updatedType='';
//     if (privilege === 'admin') updatedType = 'admin';
//     else if (privilege === 'passenger') updatedType = 'passenger';
//     else return res.status(400).json({ message: 'Invalid privilege' });
//     try {
//       const user = await User.findByIdAndUpdate(id, { type: updatedType }, { new: true });
//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }
//       res.json({ message: 'User type updated to admin', user });
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
// });

// //Forgot password endpoint
// router.post('/forgot-password', async (req, res) => {
//     const { email } = req.body;
//     if (!email) {
//         return res.status(400).json({ message: 'Please provide an email' });
//     }
//     try {
//         const user = await User.findOne({email});
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const resetToken = crypto.randomBytes(20).toString('hex');
//         user.resetPasswordToken = resetToken;
//         user.resetPasswordExpires = Date.now() + 3600000; //expires in an hour

//         await user.save();

//         //Send email with reset link
//         const transporter = nodemailer.createTransport({
//             service: 'Gmail',
//             auth: {
//                 user: process.env.EMAIL,
//                 pass: process.env.PASSWORD
//             }
//         });
//         const mailOptions = {
//             from: process.env.EMAIL,
//             to: email,
//             subject: 'Password Reset',
//             text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
//             Please click on the following link, or paste this into your browser to complete the process:\n\n
//             http://${req.headers.host}/reset/${resetToken}\n\n
//             If you did not request this, please ignore this email and your password will remain unchanged.\n`
//         };
        
//         transporter.sendMail(mailOptions, (err) => {
//             if (err) {
//                 return res.status(500).json({ message: err.message });
//             }
//             res.status(200).json({ message: 'An email has been sent to ' + email + ' with further instructions.' });
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: 'Server error: ', error});
//     }
// });

// // Password reset endpoint
// router.post('/reset-password', async (req, res) => {
//     const { resetToken, password } = req.body;
//     if (!resetToken || !password) {
//         return res.status(400).json({ message: 'Please provide a reset token and password' });
//     }
//     try {
//         const user = await User.findOne({ 
//             resetPasswordToken: resetToken, 
//             resetPasswordExpires: { $gt: Date.now() }
//         });
//         if (!user) {
//             return res.status(400).json({ message: 'Invalid or expired reset token' });
//         }
//         user.password = await bcrypt.hash(password, 8);
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpires = undefined;
//         await user.save();
        
//         res.status(200).json({ message: 'Password reset successful' });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: 'Server error: ', error});
//     }
// });

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

module.exports = router; // Export the router for use in the main app file