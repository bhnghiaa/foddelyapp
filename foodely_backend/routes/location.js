const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { verifyTokenAndDriver } = require('../middleware/verifyToken');

router.post('/', verifyTokenAndDriver, locationController.addLocation);
router.get('/:driverId', locationController.getLocations);

module.exports = router;