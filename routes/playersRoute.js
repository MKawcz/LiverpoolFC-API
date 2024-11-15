import express from 'express';
import { Player } from '../models/Player.js';
import { validatePostPut, validatePatch } from '../validation.js';

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

playersRouter.get('/:playerId', async (req, res) => {
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
    validatePostPut(['name', 'position', 'nationality', 'stats', 'contract']),
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
    validatePostPut(['name', 'position', 'nationality', 'stats', 'contract']),
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
    validatePatch(['name', 'position', 'nationality', 'stats', 'contract']),
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

playersRouter.delete('/:playerId', async (req, res) => {
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

playersRouter.get('/:playerId/stats', async (req, res) => {
    try {
        const player = await Player.findById(req.params.playerId).select('stats');
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const stats = player.stats;
        res.status(200).json({
            data: stats,
            links: {
                self: `/api/v1/players/${req.params.playerId}/stats`,
                player: `/api/v1/players/${req.params.playerId}`,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

playersRouter.put('/:playerId/stats', async (req, res) => {
    try {
        const player = await Player.findById(req.params.playerId);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }
        player.stats = req.body;
        await player.save();
        res.status(200).json(player.stats);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});

playersRouter.get('/:playerId/contract', async (req, res) => {
    try {
        const player = await Player.findById(req.params.playerId).select('contract');
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const contract = player.contract;
        res.status(200).json({
            data: contract,
            links: {
                self: `/api/v1/players/${req.params.playerId}/contract`,
                bonuses: `/api/v1/players/${req.params.playerId}/contract/bonuses`,
                player: `/api/v1/players/${req.params.playerId}`,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

playersRouter.put('/:playerId/contract', async (req, res) => {
    try {
        const player = await Player.findById(req.params.playerId);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }
        player.contract = req.body;
        await player.save();
        res.status(200).json(player.contract);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});


playersRouter.get('/:playerId/contract/bonuses', async (req, res) => {
    try {
        const player = await Player.findById(req.params.playerId).select('contract.bonuses');
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const bonuses = player.contract.bonuses;
        res.status(200).json({
            data: bonuses,
            links: {
                self: `/api/v1/players/${req.params.playerId}/contract/bonuses`,
                contract: `/api/v1/players/${req.params.playerId}/contract`,
                player: `/api/v1/players/${req.params.playerId}`,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// dodac walidacje do zagniezdzonych
playersRouter.put('/:playerId/contract/bonuses', async (req, res) => {
    try {
        const player = await Player.findById(req.params.playerId);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        // Aktualizacja bonusów
        player.contract.bonuses = req.body;
        await player.save();

        res.status(200).json({
            data: player.contract.bonuses,
            links: {
                self: `/api/v1/players/${req.params.playerId}/contract/bonuses`,
                contract: `/api/v1/players/${req.params.playerId}/contract`,
                player: `/api/v1/players/${req.params.playerId}`,
            },
        });
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});