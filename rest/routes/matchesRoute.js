import express from 'express';
import { Match } from '../models/Match.js';
import { Season } from '../models/Season.js';
import { Competition } from '../models/Competition.js';
import { Stadium } from '../models/Stadium.js';
import { Player } from '../models/Player.js';
import { validateObjectId, validateAllowedFields } from '../middleware/validators.js';

export const matchesRouter = express.Router();

// Definiujemy dozwolone pola, zachowując strukturę zagnieżdżoną
const ALLOWED_FIELDS = [
    'season', 'competition', 'date', 'stadium',
    'opponent.name', 'opponent.manager',
    'score.home', 'score.away',
    'lineup.starting', 'lineup.substitutes', 'lineup.substitutions',
    'goals', 'referee.main', 'referee.assistants', 'referee.fourth',
    'attendance'
];

// Middleware do walidacji referencji
const validateReferences = async (req, res, next) => {
    try {
        // Sprawdzamy referencje tylko jeśli zostały przesłane w żądaniu
        const checks = [];

        if (req.body.season) {
            checks.push(Season.findById(req.body.season).exec());
        }
        if (req.body.competition) {
            checks.push(Competition.findById(req.body.competition).exec());
        }
        if (req.body.stadium) {
            checks.push(Stadium.findById(req.body.stadium).exec());
        }

        // Sprawdzamy wszystkie referencje równolegle
        const results = await Promise.all(checks);

        if (results.includes(null)) {
            return res.status(400).json({
                error: 'Invalid Reference',
                message: 'One or more referenced documents do not exist',
                _links: { collection: '/api/v1/matches' }
            });
        }

        // Sprawdzamy graczy w składzie, jeśli zostali podani
        if (req.body.lineup) {
            const allPlayers = [
                ...(req.body.lineup.starting?.map(p => p.player) || []),
                ...(req.body.lineup.substitutes?.map(p => p.player) || []),
                ...(req.body.lineup.substitutions?.map(s => [s.playerIn, s.playerOut]).flat() || [])
            ];

            if (allPlayers.length > 0) {
                const playersExist = await Player.countDocuments({
                    _id: { $in: allPlayers }
                });

                if (playersExist !== allPlayers.length) {
                    return res.status(400).json({
                        error: 'Invalid Player Reference',
                        message: 'One or more players do not exist',
                        _links: { collection: '/api/v1/matches' }
                    });
                }
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/matches
matchesRouter.get('/', async (req, res) => {
    try {
        const matches = await Match.find()
            .populate('season', 'years')
            .populate('competition', 'name')
            .populate('stadium', 'name');

        res.setHeader('X-Total-Count', matches.length);
        res.setHeader('X-Resource-Type', 'Match');
        res.setHeader('Last-Modified', new Date().toUTCString());

        if (matches.length === 0) {
            return res.status(204).end();
        }

        res.status(200).json({
            data: matches.map(match => ({
                ...match.toObject(),
                _links: {
                    self: `/api/v1/matches/${match._id}`,
                    season: `/api/v1/seasons/${match.season._id}`,
                    competition: `/api/v1/competitions/${match.competition._id}`,
                    stadium: `/api/v1/stadiums/${match.stadium._id}`
                }
            })),
            _links: {
                self: '/api/v1/matches'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { self: '/api/v1/matches' }
        });
    }
});

// GET /api/v1/matches/:matchId
matchesRouter.get('/:matchId',
    validateObjectId('matchId'),
    async (req, res) => {
        try {
            const match = await Match.findById(req.params.matchId)
                .populate('season', 'years')
                .populate('competition', 'name')
                .populate('stadium', 'name')
                .populate('lineup.starting.player', 'name')
                .populate('lineup.substitutes.player', 'name')
                .populate('lineup.substitutions.playerIn', 'name')
                .populate('lineup.substitutions.playerOut', 'name')
                .populate('goals.scorer', 'name')
                .populate('goals.assistant', 'name');

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            const etag = `"match-${match._id}"`;
            if (req.headers['if-none-match'] === etag) {
                return res.status(304).end();
            }

            res.setHeader('X-Resource-Type', 'Match');
            res.setHeader('Last-Modified', match.updatedAt.toUTCString());
            res.setHeader('ETag', etag);

            res.status(200).json({
                data: match,
                _links: {
                    self: `/api/v1/matches/${match._id}`,
                    collection: '/api/v1/matches',
                    season: `/api/v1/seasons/${match.season._id}`,
                    competition: `/api/v1/competitions/${match.competition._id}`,
                    stadium: `/api/v1/stadiums/${match.stadium._id}`
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

// POST /api/v1/matches
matchesRouter.post('/',
    validateAllowedFields(ALLOWED_FIELDS),
    validateReferences,
    async (req, res) => {
        try {
            const newMatch = new Match(req.body);
            await newMatch.save();

            res.setHeader('Location', `/api/v1/matches/${newMatch._id}`);
            res.setHeader('X-Resource-Type', 'Match');
            res.setHeader('X-Resource-Id', newMatch._id.toString());

            res.status(201).json({
                data: newMatch,
                _links: {
                    self: `/api/v1/matches/${newMatch._id}`,
                    collection: '/api/v1/matches',
                    season: `/api/v1/seasons/${newMatch.season}`,
                    competition: `/api/v1/competitions/${newMatch.competition}`,
                    stadium: `/api/v1/stadiums/${newMatch.stadium}`
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/matches' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

// PUT /api/v1/matches/:matchId
matchesRouter.put('/:matchId',
    validateObjectId('matchId'),
    validateAllowedFields(ALLOWED_FIELDS),
    validateReferences,
    async (req, res) => {
        try {
            const match = await Match.findByIdAndUpdate(
                req.params.matchId,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            ).populate([
                { path: 'season', select: 'years' },
                { path: 'competition', select: 'name' },
                { path: 'stadium', select: 'name' },
                { path: 'lineup.starting.player', select: 'name' },
                { path: 'lineup.substitutes.player', select: 'name' },
                { path: 'goals.scorer', select: 'name' },
                { path: 'goals.assistant', select: 'name' }
            ]);

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            res.setHeader('X-Resource-Type', 'Match');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', match._id.toString());

            res.status(200).json({
                data: match,
                _links: {
                    self: `/api/v1/matches/${match._id}`,
                    collection: '/api/v1/matches',
                    season: `/api/v1/seasons/${match.season._id}`,
                    competition: `/api/v1/competitions/${match.competition._id}`,
                    stadium: `/api/v1/stadiums/${match.stadium._id}`
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/matches' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

// PATCH /api/v1/matches/:matchId
matchesRouter.patch('/:matchId',
    validateObjectId('matchId'),
    validateAllowedFields(ALLOWED_FIELDS),
    validateReferences,
    async (req, res) => {
        try {
            const match = await Match.findByIdAndUpdate(
                req.params.matchId,
                { $set: req.body },
                {
                    new: true,
                    runValidators: true
                }
            ).populate([
                { path: 'season', select: 'years' },
                { path: 'competition', select: 'name' },
                { path: 'stadium', select: 'name' },
                { path: 'lineup.starting.player', select: 'name' },
                { path: 'lineup.substitutes.player', select: 'name' },
                { path: 'goals.scorer', select: 'name' },
                { path: 'goals.assistant', select: 'name' }
            ]);

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            res.setHeader('X-Resource-Type', 'Match');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', match._id.toString());

            res.status(200).json({
                data: match,
                _links: {
                    self: `/api/v1/matches/${match._id}`,
                    collection: '/api/v1/matches',
                    season: `/api/v1/seasons/${match.season._id}`,
                    competition: `/api/v1/competitions/${match.competition._id}`,
                    stadium: `/api/v1/stadiums/${match.stadium._id}`
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/matches' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

// DELETE /api/v1/matches/:matchId
matchesRouter.delete('/:matchId',
    validateObjectId('matchId'),
    async (req, res) => {
        try {
            const match = await Match.findByIdAndDelete(req.params.matchId);

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            res.setHeader('X-Resource-Type', 'Match');
            res.setHeader('X-Resource-Id', match._id.toString());
            res.setHeader('X-Deleted-At', new Date().toUTCString());

            res.status(204).end();
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });