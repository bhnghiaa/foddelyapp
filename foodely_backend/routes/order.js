const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyTokenAndVendor } = require('../middleware/verifyToken');
const verifyToken = require('../middleware/verifyToken');

router.post('/', verifyTokenAndAuthorization, orderController.placeOrder);

router.get('/', verifyTokenAndAuthorization, orderController.getUserOrders);
router.get('/byRestaurant', verifyTokenAndVendor, orderController.getRestaurantOrders);
router.get('/', verifyTokenAndAuthorization, orderController.getAllOrders);
router.get('/:orderStatus/driver', verifyTokenAndAuthorization, orderController.getOrderByDriver)
router.get('/:orderStatus/customer', verifyTokenAndAuthorization, orderController.getOrderByCustomer);
router.get('/all/ready', orderController.getAllOrdersReady);
router.get('/all/:restaurantId', verifyTokenAndVendor, orderController.getAllOrderRestaurant);
router.get('/all-admin', verifyTokenAndAdmin, orderController.getAllOrderByAdmin);

router.patch('/:id', verifyTokenAndAuthorization, orderController.updateOrderStatus);
router.patch('/paymentStatus/:id', verifyTokenAndAuthorization, orderController.updateOrderPaymentStatus);


module.exports = router;
