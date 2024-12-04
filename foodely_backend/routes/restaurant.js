const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController')
const { verifyToken, verifyTokenAndVendor } = require('../middleware/verifyToken')

router.post('/', restaurantController.addRestaurant)

router.get('/:code', restaurantController.getRandomByRestaurants)
router.get('/all/:code', restaurantController.getAllNearByRestaurants)
router.get("/byId/:id", restaurantController.getRestaurantById)
router.get('/', restaurantController.getAllRestaurant)

router.patch('/rating/:id', restaurantController.updateRating)
router.patch('/:id', verifyTokenAndVendor, restaurantController.updateRestaurant)
router.patch('/availability/:id', verifyTokenAndVendor, restaurantController.updateAvailability)

router.delete('/:id', restaurantController.deleteRestaurant)

module.exports = router
