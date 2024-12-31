import express from 'express';
import { Season } from '../models/Season.js';
import { Manager } from '../models/Manager.js';
import { Trophy } from '../models/Trophy.js';
import { Player } from '../models/Player.js';
import { validateObjectId, validateAllowedFields } from '../middleware/validators.js';

export const seasonRouter = express.Router();

// Definiujemy dozwolone pola, uwzględniając strukturę zagnieżdżoną
const ALLOWED_FIELDS = [
    'years', 'status',
    'statistics.matchesPlayed', 'statistics.matchesWon',
    'statistics.matchesDrawn', 'statistics.matchesLost',
    'statistics.goalsFor', 'statistics.goalsAgainst',
    'statistics.cleanSheets', 'statistics.points',
    'trophies', 'manager',
    'topScorer.player', 'topScorer.goals',
    'topAssister.player', 'topAssister.assists'
];

// Middleware do walidacji referencji
const validateReferences = async (req, res, next) => {
    try {
        // Sprawdzamy referencje tylko jeśli zostały przesłane
        const checks = [];

        // Walidacja managera
        if (req.body.manager) {
            const managerExists = await Manager.findById(req.body.manager);
            if (!managerExists) {
                return res.status(400).json({
                    error: 'Invalid Reference',
                    message: 'Manager does not exist',
                    _links: { collection: '/api/v1/seasons' }
                });
            }
        }

        // Walidacja trofeów
        if (req.body.trophies?.length > 0) {
            const trophiesCount = await Trophy.countDocuments({
                _id: { $in: req.body.trophies }
            });
            if (trophiesCount !== req.body.trophies.length) {
                return res.status(400).json({
                    error: 'Invalid Reference',
                    message: 'One or more trophies do not exist',
                    _links: { collection: '/api/v1/seasons' }
                });
            }
        }

        // Walidacja zawodników (topScorer i topAssister)
        const playerIds = [];
        if (req.body.topScorer?.player) playerIds.push(req.body.topScorer.player);
        if (req.body.topAssister?.player) playerIds.push(req.body.topAssister.player);

        if (playerIds.length > 0) {
            const playersCount = await Player.countDocuments({
                _id: { $in: playerIds }
            });
            if (playersCount !== playerIds.length) {
                return res.status(400).json({
                    error: 'Invalid Reference',
                    message: 'One or more players do not exist',
                    _links: { collection: '/api/v1/seasons' }
                });
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/seasons
seasonRouter.get('/', async (req, res) => {
    try {
        const seasons = await Season.find()
            .populate('manager', 'name')
            .populate('trophies')
            .populate('topScorer.player', 'name.displayName')
            .populate('topAssister.player', 'name.displayName');

        res.setHeader('X-Total-Count', seasons.length);
        res.setHeader('X-Resource-Type', 'Season');
        res.setHeader('Last-Modified', new Date().toUTCString());

        if (seasons.length === 0) {
            return res.status(204).end();
        }

        res.status(200).json({
            data: seasons.map(season => ({
                ...season.toObject(),
                _links: {
                    self: `/api/v1/seasons/${season._id}`,
                    collection: '/api/v1/seasons',
                    manager: `/api/v1/managers/${season.manager._id}`,
                    trophies: season.trophies.map(trophy => `/api/v1/trophies/${trophy._id}`),
                    topScorer: season.topScorer?.player ? `/api/v1/players/${season.topScorer.player._id}` : null,
                    topAssister: season.topAssister?.player ? `/api/v1/players/${season.topAssister.player._id}` : null
                }
            })),
            _links: {
                self: '/api/v1/seasons'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { self: '/api/v1/seasons' }
        });
    }
});

// GET /api/v1/seasons/:seasonId
seasonRouter.get('/:seasonId',
    validateObjectId('seasonId'),
    async (req, res) => {
        try {
            const season = await Season.findById(req.params.seasonId)
                .populate('manager', 'name')
                .populate('trophies')
                .populate('topScorer.player', 'name.displayName')
                .populate('topAssister.player', 'name.displayName');

            if (!season) {
                return res.status(404).json({
                    error: 'Season not found',
                    _links: { collection: '/api/v1/seasons' }
                });
            }

            const etag = `"season-${season._id}"`;
            if (req.headers['if-none-match'] === etag) {
                return res.status(304).end();
            }

            res.setHeader('X-Resource-Type', 'Season');
            res.setHeader('Last-Modified', season.updatedAt.toUTCString());
            res.setHeader('ETag', etag);

            res.status(200).json({
                data: season,
                _links: {
                    self: `/api/v1/seasons/${season._id}`,
                    collection: '/api/v1/seasons',
                    manager: `/api/v1/managers/${season.manager._id}`,
                    trophies: season.trophies.map(trophy => `/api/v1/trophies/${trophy._id}`),
                    topScorer: season.topScorer?.player ? `/api/v1/players/${season.topScorer.player._id}` : null,
                    topAssister: season.topAssister?.player ? `/api/v1/players/${season.topAssister.player._id}` : null
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/seasons' }
            });
        }
});

// POST /api/v1/seasons
seasonRouter.post('/',
    validateAllowedFields(ALLOWED_FIELDS),
    validateReferences,
    async (req, res) => {
        try {
            const newSeason = new Season(req.body);
            await newSeason.save();

            res.setHeader('Location', `/api/v1/seasons/${newSeason._id}`);
            res.setHeader('X-Resource-Type', 'Season');
            res.setHeader('X-Resource-Id', newSeason._id.toString());

            res.status(201).json({
                data: newSeason,
                _links: {
                    self: `/api/v1/seasons/${newSeason._id}`,
                    collection: '/api/v1/seasons',
                    manager: `/api/v1/managers/${newSeason.manager}`,
                    trophies: (newSeason.trophies || []).map(trophy => `/api/v1/trophies/${trophy}`),
                    topScorer: newSeason.topScorer?.player ? `/api/v1/players/${newSeason.topScorer.player}` : null,
                    topAssister: newSeason.topAssister?.player ? `/api/v1/players/${newSeason.topAssister.player}` : null
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/seasons' }
                });
            }
            if (error.code === 11000) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Season with these years already exists',
                    _links: { collection: '/api/v1/seasons' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/seasons' }
            });
        }
});

// PUT /api/v1/seasons/:seasonId
seasonRouter.put('/:seasonId',
    validateObjectId('seasonId'),
    validateAllowedFields(ALLOWED_FIELDS),
    validateReferences,
    async (req, res) => {
        try {
            const season = await Season.findByIdAndUpdate(
                req.params.seasonId,
                req.body,
                { new: true, runValidators: true }
            )
                .populate('manager', 'name')
                .populate('trophies')
                .populate('topScorer.player', 'name.displayName')
                .populate('topAssister.player', 'name.displayName');

            if (!season) {
                return res.status(404).json({
                    error: 'Season not found',
                    _links: { collection: '/api/v1/seasons' }
                });
            }

            res.setHeader('X-Resource-Type', 'Season');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', season._id.toString());

            res.status(200).json({
                data: season,
                _links: {
                    self: `/api/v1/seasons/${season._id}`,
                    collection: '/api/v1/seasons',
                    manager: `/api/v1/managers/${season.manager._id}`,
                    trophies: season.trophies.map(trophy => `/api/v1/trophies/${trophy._id}`),
                    topScorer: season.topScorer?.player ? `/api/v1/players/${season.topScorer.player._id}` : null,
                    topAssister: season.topAssister?.player ? `/api/v1/players/${season.topAssister.player._id}` : null
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/seasons' }
                });
            }
            if (error.code === 11000) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Season with these years already exists',
                    _links: { collection: '/api/v1/seasons' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/seasons' }
            });
        }
});

// PATCH /api/v1/seasons/:seasonId
seasonRouter.patch('/:seasonId',
    validateObjectId('seasonId'),
    validateAllowedFields(ALLOWED_FIELDS),
    validateReferences,
    async (req, res) => {
        try {
            const season = await Season.findByIdAndUpdate(
                req.params.seasonId,
                { $set: req.body },
                { new: true, runValidators: true }
            )
                .populate('manager', 'name')
                .populate('trophies')
                .populate('topScorer.player', 'name.displayName')
                .populate('topAssister.player', 'name.displayName');

            if (!season) {
                return res.status(404).json({
                    error: 'Season not found',
                    _links: { collection: '/api/v1/seasons' }
                });
            }

            res.setHeader('X-Resource-Type', 'Season');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', season._id.toString());

            res.status(200).json({
                data: season,
                _links: {
                    self: `/api/v1/seasons/${season._id}`,
                    collection: '/api/v1/seasons',
                    manager: `/api/v1/managers/${season.manager._id}`,
                    trophies: season.trophies.map(trophy => `/api/v1/trophies/${trophy._id}`),
                    topScorer: season.topScorer?.player ? `/api/v1/players/${season.topScorer.player._id}` : null,
                    topAssister: season.topAssister?.player ? `/api/v1/players/${season.topAssister.player._id}` : null
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/seasons' }
                });
            }
            if (error.code === 11000) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Season with these years already exists',
                    _links: { collection: '/api/v1/seasons' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/seasons' }
            });
        }
});

// DELETE /api/v1/seasons/:seasonId
seasonRouter.delete('/:seasonId',
    validateObjectId('seasonId'),
    async (req, res) => {
        try {
            const season = await Season.findByIdAndDelete(req.params.seasonId);

            if (!season) {
                return res.status(404).json({
                    error: 'Season not found',
                    _links: { collection: '/api/v1/seasons' }
                });
            }

            res.setHeader('X-Resource-Type', 'Season');
            res.setHeader('X-Resource-Id', season._id.toString());
            res.setHeader('X-Deleted-At', new Date().toUTCString());

            res.status(204).end();
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/seasons' }
            });
        }
});