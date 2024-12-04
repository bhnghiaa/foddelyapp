const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vehicleType: { type: String, required: true, enum: [ 'Car', 'Bike' ] },
    vehicleNumber: { type: String, required: true },
    currentLocation: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        latitudeDelta: { type: Number, required: true, default: 0.01 },
        longitudeDelta: { type: Number, required: true, default: 0.01 }
    },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, required: true },
    totalDeliveries: { type: Number, default: 0 },
    profileImage: {
        type: String, default: 'https://res.cloudinary.com/diadiykyk/image/upload/v1718515453/samples/people/boy-snow-hoodie.jpg'
    },
}, { timestamps: true });

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
