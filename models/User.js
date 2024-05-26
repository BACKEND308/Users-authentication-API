const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  type: { type: String, required: true, enum:['admin', 'passenger'], default: 'passenger'},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, {collection: 'Users'});

UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
