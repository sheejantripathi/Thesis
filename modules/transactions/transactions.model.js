const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;

const transactionSchema = new mongoose.Schema({
  ownerAddress: String,
  policyId: { type: ObjectId, ref: 'CustomPolicy' },
}, { strict: false });
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;