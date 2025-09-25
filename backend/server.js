// backend/server.js (Edit ની સુવિધા સાથેનો અંતિમ કોડ)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

const mongoURI = 'mongodb+srv://thegroupofradhe_db_user:Tgor2019@myaccountingapp.tteu7wi.mongodb.net/?retryWrites=true&w=majority&appName=MyAccountingApp'
mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('>>> MongoDB Connected successfully!'))
    .catch(err => console.error('!!! MongoDB Connection Error:', err));

// --- Mongoose Schema for Items ---
const itemSchema = new mongoose.Schema({
    itemType: { type: String, required: true, default: 'Product' },
    name: { type: String, required: [true, 'Item Name is required.'], trim: true, unique: true },
    hsnCode: String,
    itemCode: String,
    unit: String,
    category: String,
    description: String,
    pricing: {
        sale: { price: { type: Number, default: 0 }, taxType: { type: String, default: 'Without Tax' } },
        wholesale: { price: { type: Number, default: 0 }, taxType: { type: String, default: 'Without Tax' }, minQuantity: { type: Number, default: 1 } },
        purchase: { price: { type: Number, default: 0 }, taxType: { type: String, default: 'Without Tax' } }
    },
    stock: {
        openingQuantity: { type: Number, default: 0 },
        asOfDate: { type: Date, default: Date.now },
        minStockToMaintain: { type: Number, default: 0 },
        location: String
    },
    taxRate: String
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);

app.post('/api/items', async (req, res) => {
    try {
        const newItem = new Item(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: 'Error saving item', details: error.message });
    }
});

app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find(req.query);
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching items' });
    }
});

// --- *** નવો કોડ અહીંથી શરૂ થાય છે *** ---

// Get a single item by ID
app.get('/api/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching item' });
    }
});

// Update an item by ID
app.put('/api/items/:id', async (req, res) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: 'Error updating item', details: error.message });
    }
});

// --- *** નવો કોડ અહીં પૂરો થાય છે *** ---

app.delete('/api/items/:id', async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item' });
    }
});

// --- Fallback Route ---
app.get('*', (req, res) => {
    const filePath = path.join(frontendPath, req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).sendFile(path.join(frontendPath, 'items.html'));
        }
    });
});

app.listen(port, () => {
    console.log(`>>> Server is running! Open at http://localhost:${port}`);
});