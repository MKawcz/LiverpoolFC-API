import express from 'express';
import { Match } from '../models/Match.js';
import {validateObjectId} from "../middleware/validators.js";

export const matchesRouter = express.Router();

matchesRouter.get('/', async (req, res) => {
    try {
        const matches = await Match.find().select('date opponent score');
        res.status(200).json({
            data: matches,
            links: { self: '/api/v1/matches' },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

matchesRouter.get('/:matchId',
    validateObjectId('matchId'),
    async (req, res) => {
    try {
        const match = await Match.findById(req.params.matchId).select('date opponent score');
        if (match) {
            res.status(200).json({
                data: match,
                links: {
                    self: `/api/v1/matches/${req.params.matchId}`,
                    stadium: `/api/v1/stadiums/${match.stadiumId}`,
                    goals: `/api/v1/matches/${req.params.matchId}/goals`,
                    lineup: `/api/v1/matches/${req.params.matchId}/lineup`,
                },
            });
        } else {
            res.status(404).json({ message: 'Match not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

matchesRouter.post(
    '/',
    async (req, res) => {
        try {
            const stadium = await Stadium.findById(req.body.stadiumId);
            if (!stadium) {
                return res.status(404).json({ message: 'Stadium not found' });
            }

            const newMatch = new Match(req.body);
            await newMatch.save();
            res.status(201).json({
                data: newMatch,
                links: {
                    self: `/api/v1/matches/${newMatch._id}`,
                    stadium: `/api/v1/stadiums/${newMatch.stadiumId}`,
                },
            });
        } catch (error) {
            res.status(400).json({ message: 'Invalid data', error });
        }
    }
);

matchesRouter.put(
    '/:matchId',
    validateObjectId('matchId'),
    async (req, res) => {
        try {
            const match = await Match.findByIdAndUpdate(req.params.matchId, req.body, { new: true });
            if (!match) {
                return res.status(404).json({ message: 'Match not found' });
            }
            res.status(200).json(match);
        } catch (error) {
            res.status(400).json({ message: 'Invalid data', error });
        }
    }
);

matchesRouter.patch(
    '/:matchId',
    validateObjectId('matchId'),
    async (req, res) => {
        try {
            const match = await Match.findByIdAndUpdate(req.params.matchId, req.body, { new: true });
            if (!match) {
                return res.status(404).json({ message: 'Match not found' });
            }
            res.status(200).json(match);
        } catch (error) {
            res.status(400).json({ message: 'Invalid data', error });
        }
    }
);

matchesRouter.delete('/:matchId',
    validateObjectId('matchId'),
    async (req, res) => {
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

matchesRouter.get('/:matchId/goals',
    validateObjectId('matchId'),
    async (req, res) => {
    try {
        const match = await Match.findById(req.params.matchId).select('goals');
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }
        res.status(200).json({
            data: match.goals,
            links: {
                self: `/api/v1/matches/${req.params.matchId}/goals`,
                match: `/api/v1/matches/${req.params.matchId}`
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

matchesRouter.post('/:matchId/goals',
    validateObjectId('matchId'),
    async (req, res) => {
    try {
        const match = await Match.findById(req.params.matchId);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }
        match.goals.push(req.body);
        await match.save();
        res.status(201).json(match.goals);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});

matchesRouter.get('/:matchId/lineup',
    validateObjectId('matchId'),
    async (req, res) => {
    try {
        const match = await Match.findById(req.params.matchId).select('lineup');
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }
        res.status(200).json({
            data: match.lineup,
            links: {
                self: `/api/v1/matches/${req.params.matchId}/lineup`,
                match: `/api/v1/matches/${req.params.matchId}`
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

matchesRouter.put('/:matchId/lineup',
    validateObjectId('matchId'),
    async (req, res) => {
    try {
        const match = await Match.findById(req.params.matchId);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }
        match.lineup = req.body;
        await match.save();
        res.status(200).json(match.lineup);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});
