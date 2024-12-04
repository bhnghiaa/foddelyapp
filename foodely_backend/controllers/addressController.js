const Address = require('../models/Address');
const User = require('../models/User');

module.exports = {
    addAddress: async (req, res) => {
        const newAddress = new Address({
            userId: req.user.id,
            addressLine1: req.body.addressLine1,
            postalCode: req.body.postalCode,
            default: req.body.default,
            deliveryInstructions: req.body.deliveryInstructions,
            latitude: req.body.latitude,
            longitude: req.body.longitude
        });

        try {
            if (req.body.default === true) {
                await Address.updateMany({ userId: req.user.id }, { default: false });
            }

            const address = await newAddress.save();
            return res.status(201).json(address);
        } catch (error) {
            res.status(500).json({ message: 'Server Error' });

        }
    },

    getAddresses: async (req, res) => {
        try {
            const address = await Address.find({ userId: req.user.id });
            return res.status(200).json(address);
        } catch (error) {
            res.status(500).json({ message: 'Server Error' });
        }
    },

    deleteAddress: async (req, res) => {
        const addressId = req.params.id;

        try {
            const address = await Address.findByIdAndDelete(addressId);

            if (address) {
                return res.status(200).json({ message: 'Address deleted successfully' });
            } else {
                return res.status(404).json({ message: 'Address not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Server Error' });
        }
    },

    setAddressDefault: async (req, res) => {
        const addressId = req.params.id;
        const userId = req.user.id;

        try {
            await Address.updateMany({ userId: userId }, { default: false });

            const updateAddress = await Address.findByIdAndUpdate(addressId, { default: true });

            if (updateAddress) {
                await User.findByIdAndUpdate(userId, { address: addressId });
                return res.status(200).json({ message: 'Address updated successfully' });
            } else {
                return res.status(404).json({ message: 'Address not found' });
            }
        } catch (error) {

        }
    },

    getDefaultAddress: async (req, res) => {
        const userId = req.user.id;

        try {
            const address = await Address.findOne({ userId: userId, default: true });
            return res.status(200).json(address);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}
