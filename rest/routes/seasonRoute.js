import express from 'express';
import { Season } from '../models/Season.js';
import { validateObjectId } from '../middleware/validators.js';

export const seasonRouter = express.Router();

seasonRouter.get('/', async (req, res) => {
    try {
        const seasons = await Season.find();
        res.status(200).json({
            data: seasons,
            links: { self: '/api/v1/seasons' },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

seasonRouter.get('/:seasonId', validateObjectId('seasonId'), async (req, res) => {
    try {
        const season = await Season.findById(req.params.seasonId);
        if (!season) return res.status(404).json({ message: 'Season not found' });

        res.status(200).json({
            data: season,
            links: { self: `/api/v1/seasons/${req.params.seasonId}` },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

seasonRouter.post('/', async (req, res) => {
    try {
        const newSeason = new Season(req.body);
        await newSeason.save();
        res.status(201).json({ data: newSeason });
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});

seasonRouter.put('/:seasonId', validateObjectId('seasonId'), async (req, res) => {
    try {
        const season = await Season.findByIdAndUpdate(req.params.seasonId, req.body, {
            new: true,
            runValidators: true,
        });
        if (!season) return res.status(404).json({ message: 'Season not found' });

        res.status(200).json({ data: season });
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});

seasonRouter.patch('/:seasonId', validateObjectId('seasonId'), async (req, res) => {
    try {
        const season = await Season.findByIdAndUpdate(req.params.seasonId, req.body, {
            new: true,
            runValidators: true,
        });
        if (!season) return res.status(404).json({ message: 'Season not found' });

        res.status(200).json({ data: season });
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});

seasonRouter.delete('/:seasonId', validateObjectId('seasonId'), async (req, res) => {
    try {
        const season = await Season.findByIdAndDelete(req.params.seasonId);
        if (!season) return res.status(404).json({ message: 'Season not found' });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
