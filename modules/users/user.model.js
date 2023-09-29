const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nonce: {
    type: Number,
    required: true,
    default: () => Math.floor(Math.random() * 1000000)
  },
  publicAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  username: {
    type: String,
    unique: true
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
