const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    aymentIntentId: String,
    status: String,
    amount: Number,
    customerId: String,
    restaurantId: String,

    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;