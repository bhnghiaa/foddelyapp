const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const { verifyTokenAndVendor } = require('../middleware/verifyToken');

router.post('/', foodController.addFood);

router.get("/recommendation/:code", foodController.getRandomFood);
router.get("/:id", foodController.getFoodById);
router.get('/category/:category', foodController.getFoodsBycategory);
router.get("/restaurant-foods/:id", foodController.getFoodsByRestaurant);
router.get("/search/:search", foodController.searchFoods);
router.get("/:restaurantId/:category", foodController.getFoodByRestaurantAndCategory);
router.get("/byCode/:code", foodController.getAllFoodsByCode);
router.get("/", foodController.getAllFoodByAdmin);

router.patch("/:id", verifyTokenAndVendor, foodController.updateFood);
router.patch("/availability/:id", verifyTokenAndVendor, foodController.updateAllFoodAvailabilityRestaurant);

router.delete("/:id", verifyTokenAndVendor, foodController.deleteFood);
module.exports = router;
