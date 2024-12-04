const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    driverId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;