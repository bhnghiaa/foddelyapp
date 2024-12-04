const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    addressLine1: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    },
    deliveryInstructions: {
        type: String,
        required: false
    },
    default: {
        type: Boolean,
        default: true
    },
    latitude: {
        type: Number,
        required: false
    },
    longitude: {
        type: Number,
        required: false
    }
}, { timestamps: true });

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
