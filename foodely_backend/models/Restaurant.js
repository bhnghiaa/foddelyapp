const mongoose = require('mongoose')

const RestaurantSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    foods: {
        type: Array,
        default: []
    },
    pickup: {
        type: Boolean,
        default: true
    },
    delivery: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    code: {
        type: String,
        required: true
    },
    logoUrl: {
        type: String,
        required: true,
        default: 'https://res.cloudinary.com/diadiykyk/image/upload/v1718515453/samples/people/boy-snow-hoodie.jpg'
    },
    ratings: {
        type: Number,
        default: 0
    },
    ratingCount: {
        type: String,
        default: '0'
    },
    verification: {
        type: String,
        default: 'Pending',
        enum: [ 'Pending', 'Verified', 'Rejected' ]
    },
    verificationMessage: {
        type: String,
        default: "Your restaurant is under review. We will notify you once it is verified."
    },
    coords: {
        id: {
            type: String,
        },
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        },
        latitudeDelta: {
            type: Number,
            default: 20.994586,
            required: true
        },
        longitudeDelta: {
            type: Number,
            default: 105.845165,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        }
    }
}, { timestamps: true })

const Restaurant = mongoose.model('Restaurant', RestaurantSchema)

module.exports = Restaurant
