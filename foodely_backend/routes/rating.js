const router = require('express').Router();
const ratingController = require('../controllers/ratingController');
const { verifyTokenAndAuthorization } = require('../middleware/verifyToken');

router.post('/:itemType/:itemId', verifyTokenAndAuthorization, ratingController.addRating);

router.get('/:itemType/:itemId', ratingController.getRating);

module.exports = router;