const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    time: { type: String, required: true },
    foodTags: {
        type: Array,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    foodType: { type: Array, required: true },
    code: {
        type: String,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingCount: {
        type: String,
        default: 0
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
    },
    additives: {
        type: Array,
        default: []
    },
    imageUrl: {
        type: String,
        required: true
    }
}, { timestamps: true })

const Food = mongoose.model('Food', FoodSchema)

module.exports = Food

