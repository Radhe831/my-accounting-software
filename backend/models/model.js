// backend/models/item.model.js

const mongoose = require('mongoose');

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

module.exports = Item;