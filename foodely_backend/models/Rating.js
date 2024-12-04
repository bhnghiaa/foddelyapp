const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    itemType: { type: String, enum: [ 'Restaurant', 'Food', 'Driver' ], required: true },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: function () {
            return this.itemType;
        },
        required: true
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String },
    photos: [ { type: String } ],
}, { timestamps: true });

module.exports = mongoose.model('Rating', RatingSchema);