const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;

const transactionSchema = new mongoose.Schema({
  ownerAddress: String,
  assetID: { type: ObjectId, ref: 'Notebook' },
}, { strict: false });
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;