require('dotenv').config();
const mongoose = require('mongoose')
const mongoDatabaseURL = process.env.MONGODB_URL;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

mongoose.connect(mongoDatabaseURL)


const DeckSchema = new mongoose.Schema({
    user_id: String,
    name: String,
    description: String,
    tags: [String],
    createdAt: { type: Date, default: Date.now },
    parentDeck: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck' },
});

const DeckModel = mongoose.model("deck", DeckSchema);

// Create a new deck
exports.createDeck = async (req, res) => {
    try {
        const { user_id, name, description, tags, parentDeck } = req.body;
        const newDeck = new DeckModel({ user_id, name, description, tags, parentDeck });
        const savedDeck = await newDeck.save();
        res.status(200).json({ message: 'Deck created successfully!'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Read all decks
exports.getAllDecks = async (req, res) => {
    try {
        const decks = await DeckModel.find();
        res.status(200).json(decks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Read a single deck by ID
exports.getDeckById = async (req, res) => {
    try {
        const deck = await DeckModel.findById(req.params.id);
        if (!deck) {
            return res.status(404).json({ error: "Deck not found" });
        }
        res.status(200).json(deck);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDeckByUserId = async (req, res) => {
    try {
        const decks = await DeckModel.find({ user_id: req.params.id });

        if (!decks || decks.length === 0) {
            return res.status(200).json({ error: "No decks found for this user" });
        }
        res.status(200).json(decks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a deck by ID
exports.updateDeckById = async (req, res) => {
    try {
        const { name, description, tags, parentDeck } = req.body;
        const updatedDeck = await DeckModel.findByIdAndUpdate(
            req.params.id,
            { name, description, tags, parentDeck },
            { new: true }
        );
        if (!updatedDeck) {
            return res.status(404).json({ error: "Deck not found" });
        }
        res.status(200).json(updatedDeck);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a deck by ID
exports.deleteDeckById = async (req, res) => {
    try {
        const deletedDeck = await DeckModel.findByIdAndDelete(req.params.id);
        if (!deletedDeck) {
            return res.status(404).json({ error: "Deck not found" });
        }
        res.status(200).json({ message: "Deck deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteAllDecks = async (req, res) => {
    try {
        const result = await DeckModel.deleteMany({});
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No decks found to delete" });
        }
        res.status(200).json({ message: "All decks deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
