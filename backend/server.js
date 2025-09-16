// backend/server.js - FINAL, VERIFIED, AND CORRECT CODE

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Serve Static Files from the 'frontend' folder ---
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// --- MongoDB Connection ---
const mongoURI = 'mongodb+srv://thegroupofradhe_db_user:Tgor2019@myaccountingapp.tteu7wi.mongodb.net/?retryWrites=true&w=majority&appName=MyAccountingApp'
mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('>>> MongoDB Connected successfully!'))
    .catch(err => {
        console.error('!!! MongoDB Connection Error: Could not connect to the database.');
        console.error('!!! Please ensure MongoDB is running and accessible at ' + mongoURI);
    });

// --- Mongoose Schema for Items ---
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

// --- API Endpoints ---
app.post('/api/items', async (req, res) => {
    try {
        const newItem = new Item(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        let errorMessage = 'An unknown error occurred.';
        if (error.code === 11000) { errorMessage = `An item with this name already exists.`; }
        else if (error.errors) { errorMessage = Object.values(error.errors).map(e => e.message).join(' '); }
        else { errorMessage = error.message; }
        console.error("!!! DATABASE SAVE FAILED:", errorMessage);
        res.status(400).json({ message: 'Error saving item.', details: errorMessage });
    }
});

app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (error) {
        console.error("!!! FETCH FAILED:", error.message);
        res.status(500).json({ message: 'Error fetching items', details: error.message });
    }
});

// --- Fallback Route for Single-Page Application ---
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).send('API endpoint not found');
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- Start the Server ---
const server = app.listen(port, () => {
    console.log(`>>> Server is running! Open at http://localhost:${port}`);
});

// --- Graceful Shutdown (for Ctrl+C) ---
process.on('SIGINT', () => {
    console.log('\n>>> Shutting down the server gracefully.');
    server.close(() => {
        mongoose.connection.close(false).then(() => {
            console.log('>>> MongoDB connection closed.');
            process.exit(0);
        });
    });
});
