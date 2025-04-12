const Category = require('../models/Category');

// Controller functions
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
};

const createCategory = async (req, res) => {
    const { name } = req.body;

    try {
        // Create the new category
        const newCategory = new Category({
            name
        });

        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        if (error.code === 11000) { // MongoDB duplicate key error code
            return res.status(400).json({ message: 'A category with this name already exists' });
        }
        res.status(500).json({ message: 'Error creating category' });
    }
};

const getCategoryById = async (req, res) => {
    const { categoryId } = req.params;

    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Error fetching category' });
    }
};

const updateCategory = async (req, res) => {
    const { categoryId } = req.params;
    const { name } = req.body;

    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { name },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error('Error updating category:', error);
        if (error.code === 11000) { // MongoDB duplicate key error code
            return res.status(400).json({ message: 'A category with this name already exists' });
        }
        res.status(500).json({ message: 'Error updating category' });
    }
};

const deleteCategory = async (req, res) => {
    const { categoryId } = req.params;

    try {
        const deletedCategory = await Category.findByIdAndDelete(categoryId);
        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(204).send(); // No content to send back
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Error deleting category' });
    }
};

module.exports = {
    getAllCategories,
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategory
};