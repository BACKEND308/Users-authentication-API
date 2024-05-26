const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  type: { type: String, required: true, enum:['admin', 'passenger'], default: 'passenger'},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, {collection: 'Users'});

const User = mongoose.model('User', UserSchema);
module.exports = User;
