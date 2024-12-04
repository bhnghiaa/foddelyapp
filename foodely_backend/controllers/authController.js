const User = require('../models/User');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const generateOtp = require('../utils/otp_generator');
const sendMail = require('../utils/smtp_function');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    createUser: async (req, res) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(req.body.email)) {
            return res.status(400).json({ message: 'Email is not valid' });
        }

        const minPasswordLength = 8;
        if (req.body.password.length < minPasswordLength) {
            return res.status(400).json({ message: `Password must be at least ${minPasswordLength} characters` });
        }

        try {
            const user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            const hashedPassword = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString();
            const otp = generateOtp();
            const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
                userType: req.params.userType,
                otp,
                otpExpires,
                uid: uuidv4(),
                ...(req.params.userType === 'Vendor' && { verifyVendor: false })
            });

            sendMail(newUser.email, otp);

            const result = await newUser.save();
            return res.status(201).json({ message: `${req.params.userType} created`, result });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    loginUser: async (req, res) => {

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(req.body.email)) {
            return res.status(400).json({ message: 'Email is not valid' });
        }

        const minPasswordLength = 8;
        if (req.body.password.length < minPasswordLength) {
            return res.status(400).json({ message: `Password must be at least ${minPasswordLength} characters` });
        }

        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }
            if (user.userType !== req.params.userType) {
                return res.status(400).json({ message: 'User type is not correct' });
            }
            const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
            const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

            if (originalPassword !== req.body.password) {
                return res.status(400).json({ message: 'Wrong password' });
            }

            const userToken = jwt.sign({ id: user._id, userType: user.userType, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

            const { password, otp, ...others } = user._doc;

            return res.status(200).json({ ...others, userToken });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    logoutUser: async (req, res) => {
        try {
            return res.status(200).json({ message: 'Logout success' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    reSendOtp: async (req, res) => {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const now = new Date();

            if (!user.otp || user.otpExpires < now) {
                const newOtp = generateOtp();
                const otpExpires = new Date(now.getTime() + 0.5 * 60000);

                user.otp = newOtp;
                user.otpExpires = otpExpires;

                await user.save();

                sendMail(user.email, newOtp);

                return res.status(200).json({ message: 'New OTP sent to your email.' });
            } else {
                return res.status(400).json({ message: 'OTP is still valid. Please wait before requesting a new one.' });
            }
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
