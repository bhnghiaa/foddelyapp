const Driver = require('../models/Driver');

module.exports = {
    registerDriver: async (req, res) => {
        const driver = new Driver(req.body);

        try {
            await driver.save();
            res.status(201).json(driver);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    setDriverAvailability: async (req, res) => {
        const driverId = req.user.id;

        try {
            const driver = await Driver.findById(driverId);
            if (!driver) {
                return res.status(404).json({ error: 'Driver not found' });
            }

            driver.isAvailable = !driver.isAvailable;
            await driver.save();
            res.status(200).json(driver);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
