import express from 'express';
import { PlayerStats } from '../models/PlayerStats.js';
import { validateObjectId } from '../middleware/validators.js';

export const playerStatsRouter = express.Router();

playerStatsRouter.get('/', async (req, res) => {
    try {
        const stats = await PlayerStats.find();
        res.status(200).json({
            data: stats,
            links: { self: '/api/v1/player-stats' },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

playerStatsRouter.get('/:statsId', validateObjectId('statsId'), async (req, res) => {
    try {
        const stats = await PlayerStats.findById(req.params.statsId);
        if (!stats) return res.status(404).json({ message: 'Stats not found' });

        res.status(200).json({ data: stats });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

playerStatsRouter.post('/', async (req, res) => {
    try {
        const newStats = new PlayerStats(req.body);
        await newStats.save();
        res.status(201).json({ data: newStats });
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});

playerStatsRouter.put('/:statsId', validateObjectId('statsId'), async (req, res) => {
    try {
        const stats = await PlayerStats.findByIdAndUpdate(req.params.statsId, req.body, {
            new: true,
            runValidators: true,
        });
        if (!stats) return res.status(404).json({ message: 'Stats not found' });

        res.status(200).json({ data: stats });
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});

playerStatsRouter.patch('/:statsId', validateObjectId('statsId'), async (req, res) => {
    try {
        const stats = await PlayerStats.findByIdAndUpdate(req.params.statsId, req.body, {
            new: true,
            runValidators: true,
        });
        if (!stats) return res.status(404).json({ message: 'Stats not found' });

        res.status(200).json({ data: stats });
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});

playerStatsRouter.delete('/:statsId', validateObjectId('statsId'), async (req, res) => {
    try {
        const stats = await PlayerStats.findByIdAndDelete(req.params.statsId);
        if (!stats) return res.status(404).json({ message: 'Stats not found' });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
