const router = require('express').Router();
const cartController = require('../controllers/cartController');
const { verifyTokenAndAuthorization } = require('../middleware/verifyToken');

router.post('/', verifyTokenAndAuthorization, cartController.addProductToCart);

router.patch('/decrement/:id', verifyTokenAndAuthorization, cartController.decrementProductQuantity);
router.patch('/increment/:id', verifyTokenAndAuthorization, cartController.incrementProductQuantity);


router.delete('/:id', verifyTokenAndAuthorization, cartController.removeCartItem);

router.get('/', verifyTokenAndAuthorization, cartController.getCart);

router.get('/count', verifyTokenAndAuthorization, cartController.getCartCount);

module.exports = router;
