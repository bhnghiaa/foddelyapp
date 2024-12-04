const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyTokenAndAdmin } = require('../middleware/verifyToken');

router.patch('/:id', categoryController.updateCategory);
router.delete('/:id', verifyTokenAndAdmin, categoryController.deleteCategory);
router.post('/', categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/random', categoryController.getRandomCategories);
router.post('/image/:id', verifyTokenAndAdmin, categoryController.patchCategoryImage);

module.exports = router;