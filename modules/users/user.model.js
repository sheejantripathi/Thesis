const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;

const userSchema = new mongoose.Schema({
  nonce: {
    type: Number,
    required: true,
    default: () => Math.floor(Math.random() * 1000000)
  },
  policies: [{
     type: ObjectId,
     ref: 'CustomPolicy',
  }],
  groups: [{
    contractAddress: String,
    name: String,
 }],
  publicAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  username: {
    type: String
  }
});

module.exports = mongoose.model('User', userSchema);
