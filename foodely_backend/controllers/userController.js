const User = require('../models/User')

module.exports = {
    getUser: async (req, res) => {
        const userId = req.user.id
        try {
            const user = await User.findById({ _id: userId }, { password: 0, __v: 0, createdAt: 0, updatedAt: 0 })
            res.status(200).json(user)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    },
    getDriver: async (req, res) => {
        const driverId = req.params.driverId
        try {
            const user = await User.findById({ _id: driverId }, { password: 0, __v: 0, createdAt: 0, updatedAt: 0 })
            res.status(200).json(user)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    },
    deleteUser: async (req, res) => {
        const userId = req.user.id
        try {
            await User.findByIdAndDelete({ _id: userId })
            res.status(200).json({ message: 'User deleted successfully' })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    },

    updateUser: async (req, res) => {
        const userId = req.user.id
        try {
            const user = await User.findByIdAndUpdate({ _id: userId }, { $set: req.body }, { new: true })
            res.status(200).json(user)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    },

    verifyAccount: async (req, res) => {
        const otp = req.params.otp;

        try {
            const user = await User.findById({ _id: req.user.id });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (otp === user.otp) {
                user.verification = true;
                user.otp = 'none';
                await user.save();

                const { password, __v, otp, createdAt, ...data } = user._doc;
                return res.status(200).json(data);
            } else {
                return res.status(400).json({ message: 'Invalid OTP' });
            }
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    verifyPhone: async (req, res) => {
        const userPhone = req.params.phone;

        try {
            const user = await User.findById({ _id: req.user.id });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.phoneVerification = true;
            user.phone = userPhone;

            await user.save();

            const { password, __v, otp, createdAt, ...data } = user._doc;
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    getUserByAdmin: async (req, res) => {
        try {
            const users = await User.find({ userType: { $in: [ 'Client', 'Vendor', 'Driver' ] } }, { password: 0, __v: 0, createdAt: 0, updatedAt: 0 });
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    setVerifyAccountByAdmin: async (req, res) => {
        const userId = req.params.userId;
        const verification = req.body.verification;

        try {
            const user = await User.findById({ _id: userId });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.verification = verification;
            await user.save();

            const { password, __v, otp, createdAt, ...data } = user._doc;
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}
