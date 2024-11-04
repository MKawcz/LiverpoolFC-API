// routes/matchesRoute.js
import express from 'express';
import { Match } from '../models/Match.js';

export const matchesRouter = express.Router();

// GET all matches
matchesRouter.get('/', async (req, res) => {
    try {
        const matches = await Match.find().populate('goals.playerId');
        res.status(200).json({
            data: matches,
            links: { self: '/api/v1/matches' },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// GET a specific match
matchesRouter.get('/:matchId', async (req, res) => {
    try {
        const match = await Match.findById(req.params.matchId).populate('goals.playerId');
        if (match) {
            res.status(200).json({
                data: match,
                links: {
                    self: `/api/v1/matches/${req.params.matchId}`,
                    goals: `/api/v1/matches/${req.params.matchId}/goals`,
                    lineup: `/api/v1/matches/${req.params.matchId}/lineup`,
                }
            });
        } else {
            res.status(404).json({ message: 'Match not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// POST a new match
matchesRouter.post('/', async (req, res) => {
    try {
        const newMatch = new Match(req.body);
        await newMatch.save();
        res.status(201).json(newMatch);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});

// PUT to update a specific match
matchesRouter.put('/:matchId', async (req, res) => {
    try {
        const match = await Match.findByIdAndUpdate(req.params.matchId, req.body, { new: true });
        if (match) {
            res.status(200).json(match);
        } else {
            res.status(404).json({ message: 'Match not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});

// DELETE a specific match
matchesRouter.delete('/:matchId', async (req, res) => {
    try {
        const match = await Match.findByIdAndDelete(req.params.matchId);
        if (match) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Match not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
