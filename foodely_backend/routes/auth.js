const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register/:userType', authController.createUser);
router.post('/login/:userType', authController.loginUser);
router.post('/logout', authController.logoutUser);
router.post('/resendOTP', authController.reSendOtp);

module.exports = router;