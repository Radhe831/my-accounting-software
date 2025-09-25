const Category = require('../models/category.model');

exports.getAll = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.create = async (req, res) => {
    try {
        const newCategory = new Category({ name: req.body.name });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await Category.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};