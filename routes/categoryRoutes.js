const express = require('express');
const router = express.Router();

const {
    getAllCategories,
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require('../controllers/CategoryController');

// Routes for categories
router.get('/', getAllCategories);          // Get all categories
router.post('/', createCategory);           // Create a new category
router.get('/:categoryId', getCategoryById); // Get category by ID
router.put('/:categoryId', updateCategory); // Update category by ID
router.delete('/:categoryId', deleteCategory); // Delete category by ID

module.exports = router;
