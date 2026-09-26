const Item = require('../models/item.model');

exports.createItem = async (req, res) => {
    try {
        const newItem = new Item(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        let errorMessage = 'An unknown error occurred.';
        if (error.code === 11000) {
            errorMessage = 'An item with this name already exists.';
        } else if (error.errors) {
            errorMessage = Object.values(error.errors).map(e => e.message).join(' ');
        } else {
            errorMessage = error.message;
        }

        console.error('!!! DATABASE SAVE FAILED:', errorMessage);
        res.status(400).json({ message: 'Error saving item.', details: errorMessage });
    }
};

exports.getAllItems = async (req, res) => {
    try {
        const { itemType } = req.query;
        const filter = itemType ? { itemType } : {};
        const items = await Item.find(filter).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        console.error('!!! FETCH FAILED:', error.message);
        res.status(500).json({ message: 'Error fetching items', details: error.message });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedItem = await Item.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        res.json(updatedItem);
    } catch (error) {
        let errorMessage = 'An unknown error occurred.';
        if (error.code === 11000) {
            errorMessage = 'An item with this name already exists.';
        } else if (error.errors) {
            errorMessage = Object.values(error.errors).map(e => e.message).join(' ');
        } else {
            errorMessage = error.message;
        }

        console.error('!!! DATABASE UPDATE FAILED:', errorMessage);
        res.status(400).json({ message: 'Error updating item.', details: errorMessage });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedItem = await Item.findByIdAndDelete(id);
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        res.json({ message: 'Item deleted successfully.', item: deletedItem });
    } catch (error) {
        console.error('!!! DELETE FAILED:', error.message);
        res.status(500).json({ message: 'Error deleting item.', details: error.message });
    }
};
