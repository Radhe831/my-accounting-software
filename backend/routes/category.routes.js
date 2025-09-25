const express = require('express');
const router = express.Router();
const Category = require('../models/category.model');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Create a new category
router.post('/', async (req, res) => {
    try {
        const newCategory = new Category({ name: req.body.name });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) { res.status(400).json({ message: 'Category already exists or invalid name.' }); }
});

// --- *** નવો કોડ અહીંથી શરૂ થાય છે *** ---
// Update a category by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true, runValidators: true });
        if (!updatedCategory) return res.status(404).json({ message: 'Category not found' });
        res.json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: 'Could not update category', details: error.message });
    }
});
// --- *** નવો કોડ અહીં પૂરો થાય છે *** ---

// Delete a category
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Category.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;