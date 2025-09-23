// backend/routes/item.routes.js

const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');

// --- API Endpoints for Items ---

// POST /api/items - Create a new item
router.post('/', itemController.createItem);

// GET /api/items - Get all items
router.get('/', itemController.getAllItems);

// PUT /api/items/:id - Update an item by its ID
router.put('/:id', itemController.updateItem);

// DELETE /api/items/:id - Delete an item by its ID
router.delete('/:id', itemController.deleteItem);

module.exports = router;