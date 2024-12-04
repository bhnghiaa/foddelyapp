const router = require('express').Router();
const transactionController = require('../controllers/transactionController');
const verifyToken = require('../middleware/verifyToken');

router.post('/create-payment-intent', transactionController.createTransaction);
router.get('/', transactionController.getTransactions);

module.exports = router;