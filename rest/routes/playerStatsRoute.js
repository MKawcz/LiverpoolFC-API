import express from 'express';
import { PlayerStats } from '../models/PlayerStats.js';
import { validateObjectId, validateAllowedFields } from '../middleware/validators.js';

export const playerStatsRouter = express.Router();

// Definiujemy dozwolone pola, uwzględniając strukturę zagnieżdżoną
const ALLOWED_FIELDS = [
    'appearances', 'minutesPlayed',
    'goals.total', 'goals.penalties', 'goals.freeKicks',
    'assists', 'keyPasses',
    'passes.total', 'passes.accurate',
    'tackles', 'interceptions', 'clearances',
    'cleanSheets', 'saves',
    'cards.yellow', 'cards.red'
];

// GET /api/v1/player-stats
playerStatsRouter.get('/', async (req, res) => {
    try {
        const stats = await PlayerStats.find();

        res.setHeader('X-Total-Count', stats.length);
        res.setHeader('X-Resource-Type', 'PlayerStats');
        res.setHeader('Last-Modified', new Date().toUTCString());

        if (stats.length === 0) {
            return res.status(204).end();
        }

        res.status(200).json({
            data: stats.map(stat => ({
                ...stat.toObject(),
                _links: {
                    self: `/api/v1/player-stats/${stat._id}`,
                    collection: '/api/v1/player-stats'
                }
            })),
            _links: {
                self: '/api/v1/player-stats'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { self: '/api/v1/player-stats' }
        });
    }
});

// GET /api/v1/player-stats/:statsId
playerStatsRouter.get('/:statsId',
    validateObjectId('statsId'),
    async (req, res) => {
        try {
            const stats = await PlayerStats.findById(req.params.statsId);

            if (!stats) {
                return res.status(404).json({
                    error: 'Player stats not found',
                    _links: { collection: '/api/v1/player-stats' }
                });
            }

            const etag = `"stats-${stats._id}"`;
            if (req.headers['if-none-match'] === etag) {
                return res.status(304).end();
            }

            res.setHeader('X-Resource-Type', 'PlayerStats');
            res.setHeader('Last-Modified', stats.updatedAt?.toUTCString() || new Date().toUTCString());
            res.setHeader('ETag', etag);

            res.status(200).json({
                data: stats,
                _links: {
                    self: `/api/v1/player-stats/${stats._id}`,
                    collection: '/api/v1/player-stats'
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/player-stats' }
            });
        }
    });

// POST /api/v1/player-stats
playerStatsRouter.post('/',
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const newStats = new PlayerStats(req.body);
            await newStats.save();

            res.setHeader('Location', `/api/v1/player-stats/${newStats._id}`);
            res.setHeader('X-Resource-Type', 'PlayerStats');
            res.setHeader('X-Resource-Id', newStats._id.toString());

            res.status(201).json({
                data: newStats,
                _links: {
                    self: `/api/v1/player-stats/${newStats._id}`,
                    collection: '/api/v1/player-stats'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/player-stats' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/player-stats' }
            });
        }
    });

// PUT /api/v1/player-stats/:statsId
playerStatsRouter.put('/:statsId',
    validateObjectId('statsId'),
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const stats = await PlayerStats.findByIdAndUpdate(
                req.params.statsId,
                req.body,
                { new: true, runValidators: true }
            );

            if (!stats) {
                return res.status(404).json({
                    error: 'Player stats not found',
                    _links: { collection: '/api/v1/player-stats' }
                });
            }

            res.setHeader('X-Resource-Type', 'PlayerStats');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', stats._id.toString());

            res.status(200).json({
                data: stats,
                _links: {
                    self: `/api/v1/player-stats/${stats._id}`,
                    collection: '/api/v1/player-stats'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/player-stats' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/player-stats' }
            });
        }
    });

// PATCH /api/v1/player-stats/:statsId
playerStatsRouter.patch('/:statsId',
    validateObjectId('statsId'),
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const stats = await PlayerStats.findByIdAndUpdate(
                req.params.statsId,
                { $set: req.body },
                { new: true, runValidators: true }
            );

            if (!stats) {
                return res.status(404).json({
                    error: 'Player stats not found',
                    _links: { collection: '/api/v1/player-stats' }
                });
            }

            res.setHeader('X-Resource-Type', 'PlayerStats');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', stats._id.toString());

            res.status(200).json({
                data: stats,
                _links: {
                    self: `/api/v1/player-stats/${stats._id}`,
                    collection: '/api/v1/player-stats'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/player-stats' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/player-stats' }
            });
        }
    });

// DELETE /api/v1/player-stats/:statsId
playerStatsRouter.delete('/:statsId',
    validateObjectId('statsId'),
    async (req, res) => {
        try {
            const stats = await PlayerStats.findByIdAndDelete(req.params.statsId);

            if (!stats) {
                return res.status(404).json({
                    error: 'Player stats not found',
                    _links: { collection: '/api/v1/player-stats' }
                });
            }

            res.setHeader('X-Resource-Type', 'PlayerStats');
            res.setHeader('X-Resource-Id', stats._id.toString());
            res.setHeader('X-Deleted-At', new Date().toUTCString());

            res.status(204).end();
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/player-stats' }
            });
        }
    });