const express = require('express');
const router = express.Router();
const Party = require('../models/party.model.js');


// CREATE
router.post('/', async (req, res) => {
    try {
        const party = new Party(req.body);
        await party.save();
        res.status(201).json(party);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET ALL + SEARCH
router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;

        let filter = {};

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        if (category) {
            filter.category = category;
        }

        const parties = await Party.find(filter).sort({ createdAt: -1 });
        res.json(parties);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET ONE
router.get('/:id', async (req, res) => {
    try {
        const party = await Party.findById(req.params.id);
        if (!party) return res.status(404).json({ message: "Not found" });
        res.json(party);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE
router.put('/:id', async (req, res) => {
    try {
        const party = await Party.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!party) return res.status(404).json({ message: "Not found" });

        res.json(party);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        await Party.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;