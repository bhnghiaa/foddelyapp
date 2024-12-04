const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { verifyTokenAndAuthorization } = require('../middleware/verifyToken');

router.post('/', verifyTokenAndAuthorization, addressController.addAddress);

router.delete('/:id', verifyTokenAndAuthorization, addressController.deleteAddress);

router.get('/default', verifyTokenAndAuthorization, addressController.getDefaultAddress);

router.get('/', verifyTokenAndAuthorization, addressController.getAddresses);

router.patch('/default/:id', verifyTokenAndAuthorization, addressController.setAddressDefault);

module.exports = router;
