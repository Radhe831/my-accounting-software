// backend/server.js

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

const mongoURI = 'mongodb+srv://thegroupofradhe_db_user:Tgor2019@myaccountingapp.tteu7wi.mongodb.net/?retryWrites=true&w=majority&appName=MyAccountingApp';
mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('>>> MongoDB Connected successfully!'))
    .catch(err => console.error('!!! MongoDB Connection Error:', err));

const itemSchema = new mongoose.Schema({
    itemType: { type: String, required: true, default: 'Product' },
    name: { type: String, required: [true, 'Item Name is required.'], trim: true, unique: true },
    pricing: {
        sale: { price: { type: Number, default: 0 } }
    }
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
        const items = await Item.find();
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
            res.status(404).sendFile(path.join(frontendPath, 'index.html'));
        }
    });
});

app.listen(port, () => {
    console.log(`>>> Server is running with nodemon! Open at http://localhost:${port}`);
});