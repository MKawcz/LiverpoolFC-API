import express from 'express';
import { Player } from '../models/Player.js';
import {validateObjectId} from "../middleware/validators.js";

export const playersRouter = express.Router();

playersRouter.get('/', async (req, res) => {
    try {
        const players = await Player.find().select('name position nationality');
        res.status(200).json({
            data: players,
            links: { self: '/api/v1/players' },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

playersRouter.get('/:playerId',
    validateObjectId('playerId'),
    async (req, res) => {
    try {
        const player = await Player.findById(req.params.playerId).select('name position nationality');
        if (player) {
            res.status(200).json({
                data: player,
                links: {
                    self: `/api/v1/players/${req.params.playerId}`,
                    stats: `/api/v1/players/${req.params.playerId}/stats`,
                    contract: `/api/v1/players/${req.params.playerId}/contract`,
                }
            });
        } else {
            res.status(404).json({ message: 'Player not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

playersRouter.post(
    '/',
    async (req, res) => {
        try {
            const newPlayer = new Player(req.body);
            await newPlayer.save();
            res.status(201).json(newPlayer);
        } catch (error) {
            res.status(400).json({ message: 'Invalid data', error });
        }
});

playersRouter.put(
    '/:playerId',
    validateObjectId('playerId'),
    async (req, res) => {
        try {
            const player = await Player.findByIdAndUpdate(req.params.playerId, req.body, { new: true });
            if (player) {
                res.status(200).json(player);
            } else {
                res.status(404).json({ message: 'Player not found' });
            }
        } catch (error) {
            res.status(400).json({ message: 'Invalid data', error });
        }
});

playersRouter.patch(
    '/:playerId',
    validateObjectId('playerId'),
    async (req, res) => {
        try {
            const player = await Player.findByIdAndUpdate(req.params.playerId, req.body, { new: true });
            if (player) {
                res.status(200).json(player);
            } else {
                res.status(404).json({ message: 'Player not found' });
            }
        } catch (error) {
            res.status(400).json({ message: 'Invalid data', error });
        }
    }
);

playersRouter.delete('/:playerId',
    validateObjectId('playerId'),
    async (req, res) => {
    try {
        const player = await Player.findByIdAndDelete(req.params.playerId);
        if (player) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Player not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});