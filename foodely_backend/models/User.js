const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: String,
        required: false,
        default: "none"
    },
    password: {
        type: String,
        required: true
    },
    verification: {
        type: Boolean,
        default: false
    },
    phone: {
        type: String,
        default: "0123456789"
    },
    phoneVerification: {
        type: Boolean,
        default: false
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: false
    },
    userType: {
        type: String,
        required: true,
        default: 'Client',
        enum: [ 'Client', 'Admin', 'Vendor', 'Driver' ]
    },
    profile: {
        type: String,
        default: 'https://res.cloudinary.com/diadiykyk/image/upload/v1718515453/samples/people/boy-snow-hoodie.jpg'
    },
    fcm: {
        type: String,
        default: "none"
    },
    vefifyVendor: {
        type: Boolean,
        required: false,
        default: false
    },
    otpExpires: { type: Date },
    uid: { type: String, unique: true, required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
