import express from 'express';
import { Trophy } from '../models/Trophy.js';
import {validateObjectId} from "../middleware/validators.js";

export const trophiesRouter = express.Router();

trophiesRouter.get('/', async (req, res) => {
    try {
        const trophies = await Trophy.find().select('finalsWon');
        res.status(200).json({
            data: trophies,
            links: { self: '/api/v1/trophies' },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

trophiesRouter.get('/:trophyId',
    validateObjectId('trophyId'),
    async (req, res) => {
    try {
        const trophy = await Trophy.findById(req.params.trophyId).select('finalsWon');
        if (trophy) {
            res.status(200).json({
                data: trophy,
                links: {
                    self: `/api/v1/trophies/${req.params.trophyId}`,
                    seasons: `/api/v1/trophies/${req.params.trophyId}/seasons`,
                }
            });
        } else {
            res.status(404).json({ message: 'Trophy not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

trophiesRouter.post(
    '/',
    async (req, res) => {
        try {
            const newTrophy = new Trophy(req.body);
            await newTrophy.save();
            res.status(201).json(newTrophy);
        } catch (error) {
            res.status(400).json({ message: 'Invalid data', error });
        }
});

trophiesRouter.put(
    '/:trophyId',
    validateObjectId('trophyId'),
    async (req, res) => {
        try {
            const trophy = await Trophy.findByIdAndUpdate(req.params.trophyId, req.body, { new: true });
            if (trophy) {
                res.status(200).json(trophy);
            } else {
                res.status(404).json({ message: 'Trophy not found' });
            }
        } catch (error) {
            res.status(400).json({ message: 'Invalid data', error });
        }
});

trophiesRouter.patch(
    '/:trophyId',
    validateObjectId('trophyId'),
    async (req, res) => {
        try {
            const trophy = await Trophy.findByIdAndUpdate(req.params.trophyId, req.body, { new: true });
            if (trophy) {
                res.status(200).json(trophy);
            } else {
                res.status(404).json({ message: 'Trophy not found' });
            }
        } catch (error) {
            res.status(400).json({ message: 'Invalid data', error });
        }
    }
);

trophiesRouter.delete('/:trophyId',
    validateObjectId('trophyId'),
    async (req, res) => {
    try {
        const trophy = await Trophy.findByIdAndDelete(req.params.trophyId);
        if (trophy) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Trophy not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});