const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
    },
    quantity: {
        type: Number,
        default: 1
    },
    price: {
        type: Number,
        required: true
    },
    additives: { type: Array },
    instructions: { type: String, default: '' }
})

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    orderItems: [ orderItemSchema ],
    orderTotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    deliveryAddress: {
        type: String,
    },
    restaurantAddress: {
        type: String,
        required: true
    },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, default: 'Pending', enum: [ 'Pending', 'Paid', 'Failed' ] },
    orderStatus: { type: String, default: 'Pending', enum: [ 'Placed', 'Preparing', "Ready", "Pickup", 'Delivered', 'Cancelled', "Out_for_Delivery" ] },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    restaurantCoords: [ Number ],
    recipientCoords: [ Number ],
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    feedback: {
        type: String,
    },
    promoCode: {
        type: String,
    },
    discountAmount: {
        type: Number,
    },
    notes: {
        type: String
    }
}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
