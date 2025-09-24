// backend/server.js (અંતિમ અને સાચો કોડ)

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

// --- આ સાચો અને સંપૂર્ણ સ્કીમા છે ---
const itemSchema = new mongoose.Schema({
    itemType: { type: String, required: true, default: 'Product' },
    name: { type: String, required: [true, 'Item Name is required.'], trim: true, unique: true },
    hsnCode: String,
    itemCode: String,
    unit: String,
    category: String,
    description: String,
    itemImage: String,
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
    taxRate: { type: String, default: 'None' }
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);

app.post('/api/items', async (req, res) => {
    try {
        const newItem = new Item(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        let errorMessage = 'An error occurred.';
        if (error.code === 11000) errorMessage = `An item with this name already exists.`;
        else if (error.errors) errorMessage = Object.values(error.errors).map(e => e.message).join(' ');
        else errorMessage = error.message;
        res.status(400).json({ message: 'Error saving item.', details: errorMessage });
    }
});

app.get('/api/items', async (req, res) => {
    try {
        const { itemType } = req.query;
        let query = {};
        if (itemType) {
            query.itemType = itemType;
        }
        const items = await Item.find(query);
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching items' });
    }
});

app.delete('/api/items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedItem = await Item.findByIdAndDelete(id);
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        res.json({ message: 'Item deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item' });
    }
});

app.get('*', (req, res) => {
    const filePath = path.join(frontendPath, req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
});

app.listen(port, () => {
    console.log(`>>> Server is running! Open at http://localhost:${port}`);
});