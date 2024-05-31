require('dotenv').config();
const mongoose = require('mongoose')
const mongoDatabaseURL = process.env.MONGODB_URL;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

mongoose.connect(mongoDatabaseURL)

const CardSchema = new mongoose.Schema({
    deck_id: String,
    front: String,
    back: String,
    createdBy: String,
    createdAt: { type: Date, default: Date.now },
});


const CardModel = mongoose.model("card", CardSchema);


// Create a new card
exports.createCard = async (req, res) => {
    try {
        const { deck_id, front, back, createdBy } = req.body;
        const newCard = new CardModel({ deck_id, front, back, createdBy });
        const savedCard = await newCard.save();
        res.status(201).json(savedCard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Read all cards
exports.getAllCards = async (req, res) => {
    try {
        const cards = await CardModel.find();
        res.status(200).json(cards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Read a single card by ID
exports.getCardById = async (req, res) => {
    try {
        const card = await CardModel.findById(req.params.id);
        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }
        res.status(200).json(card);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCardsByDeckId = async (req, res) => {
    try {
        const card = await CardModel.find({ deck_id: req.params.id });

        if (!card || card.length === 0) {
            return res.status(404).json({ error: "No Card found for this deck" });
        }
        res.status(200).json(card);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a card by ID
exports.updateCardById = async (req, res) => {
    try {
        const { front, back } = req.body;
        const updatedCard = await CardModel.findByIdAndUpdate(
            req.params.id,
            { front, back },
            { new: true }
        );
        if (!updatedCard) {
            return res.status(404).json({ error: "Card not found" });
        }
        res.status(200).json(updatedCard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a card by ID
exports.deleteCardById = async (req, res) => {
    try {
        const deletedCard = await CardModel.findByIdAndDelete(req.params.id);
        if (!deletedCard) {
            return res.status(404).json({ error: "Card not found" });
        }
        res.status(200).json({ message: "Card deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteAllCards = async (req, res) => {
    try {
        const result = await CardModel.deleteMany({});
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No card found to delete" });
        }
        res.status(200).json({ message: "All cards deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
