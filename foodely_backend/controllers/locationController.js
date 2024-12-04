const Location = require('../models/Location');

module.exports = {

    updateLocation: async (req, res) => {
        const { latitude, longitude } = req.body;
        const driverId = req.user.id;

        try {
            await Location.findOneAndUpdate({ driverId }, { latitude, longitude });
            res.status(200).json({ message: 'Cập nhật vị trí thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi cập nhật vị trí' });
        }
    },

    getLocations: async (req, res) => {
        const driverId = req.params.driverId;

        try {
            const locations = await Location.find({ driverId });
            return res.status(200).json({ locations });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi lấy vị trí' });
        }
    },
    addLocation: async (req, res) => {
        const { latitude, longitude } = req.body;
        const driverId = req.user.id;

        try {
            const existingLocation = await Location.findOne({ driverId });
            if (existingLocation) {
                await Location.findOneAndUpdate({ driverId }, { latitude, longitude });
                return res.status(200).json({ message: 'Cập nhật vị trí thành công' });
            }

            const location = new Location({
                driverId,
                latitude,
                longitude
            });

            await location.save();
            res.status(201).json({ message: 'Thêm vị trí thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi thêm vị trí' });
        }
    },
}