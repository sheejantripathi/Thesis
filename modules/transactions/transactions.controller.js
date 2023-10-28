const mongoose = require("mongoose");
const Transaction = require("./transactions.model");

class TransactionsController {

    async addTransaction(transactionDetails) {
        const transactionData = new Transaction(transactionDetails);
        return await transactionData.save();
    }
    
    async getByOwner(ownerAddress) {
        let result = await Transaction.find({ ownerAddress: ownerAddress }).populate('policyId');
        return result;
      }

}

module.exports = new TransactionsController();