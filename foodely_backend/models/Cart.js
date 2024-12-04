const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true
    },
    additives: {
        type: Array,
        default: [],
        required: false
    },
    totalPrice: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    note: {
        type: String,
        required: false
    }
}, { timestamps: true })

module.exports = mongoose.model('Cart', CartSchema);
