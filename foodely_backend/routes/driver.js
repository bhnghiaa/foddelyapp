const express = require('express');
const router = express.Router();
const { verifyTokenAndAuthorization, verifyToken } = require('../middleware/verifyToken');
const { registerDriver, setDriverAvailability } = require('../controllers/driverController');

router.post('/register', verifyTokenAndAuthorization, registerDriver);
router.patch('/set-availability', verifyTokenAndAuthorization, setDriverAvailability);

module.exports = router;