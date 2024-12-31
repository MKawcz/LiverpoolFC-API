import express from 'express';
import { Player } from '../models/Player.js';
import { Contract } from '../models/Contract.js';
import { PlayerStats } from '../models/PlayerStats.js';
import { validateObjectId, validateAllowedFields } from '../middleware/validators.js';

export const playersRouter = express.Router();

// Definiujemy dozwolone pola na podstawie schematu, uwzględniając strukturę zagnieżdżoną
const ALLOWED_FIELDS = [
    'name.first', 'name.last', 'name.displayName',
    'position', 'nationality', 'dateOfBirth',
    'height', 'weight', 'status', 'jerseyNumber',
    'marketValue.value', 'marketValue.currency',
    'attributes.technical.pace', 'attributes.technical.shooting',
    'attributes.technical.passing', 'attributes.technical.dribbling',
    'attributes.technical.defending', 'attributes.technical.physical',
    'attributes.mental.vision', 'attributes.mental.composure',
    'attributes.mental.leadership', 'attributes.mental.workRate',
    'attributes.goalkeeper.handling', 'attributes.goalkeeper.reflexes',
    'attributes.goalkeeper.positioning', 'attributes.goalkeeper.kicking'
];

// Middleware do walidacji referencji
const validateReferences = async (req, res, next) => {
    try {
        // Sprawdzamy referencje tylko jeśli zostały przesłane
        if (req.body.currentContract) {
            const contractExists = await Contract.findById(req.body.currentContract);
            if (!contractExists) {
                return res.status(400).json({
                    error: 'Invalid Reference',
                    message: 'Current contract does not exist',
                    _links: { collection: '/api/v1/players' }
                });
            }
        }

        if (req.body.stats) {
            const statsExists = await PlayerStats.findById(req.body.stats);
            if (!statsExists) {
                return res.status(400).json({
                    error: 'Invalid Reference',
                    message: 'Player stats do not exist',
                    _links: { collection: '/api/v1/players' }
                });
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/players
playersRouter.get('/', async (req, res) => {
    try {
        const players = await Player.find()
            .populate('stats', 'goals assists')
            .populate('currentContract', 'start end salary')
            .populate('contractsHistory', 'start end');

        res.setHeader('X-Total-Count', players.length);
        res.setHeader('X-Resource-Type', 'Player');
        res.setHeader('Last-Modified', new Date().toUTCString());

        if (players.length === 0) {
            return res.status(204).end();
        }

        res.status(200).json({
            data: players.map(player => ({
                ...player.toObject(),
                _links: {
                    self: `/api/v1/players/${player._id}`,
                    stats: player.stats ? `/api/v1/player-stats/${player.stats}` : null,
                    currentContract: player.currentContract ? `/api/v1/contracts/${player.currentContract}` : null,
                    contractsHistory: player.contractsHistory?.map(contract =>
                        `/api/v1/contracts/${contract._id}`
                    )
                }
            })),
            _links: {
                self: '/api/v1/players'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { self: '/api/v1/players' }
        });
    }
});

// GET /api/v1/players/:playerId
playersRouter.get('/:playerId',
    validateObjectId('playerId'),
    async (req, res) => {
        try {
            const player = await Player.findById(req.params.playerId)
                .populate('stats')
                .populate('currentContract')
                .populate('contractsHistory');

            if (!player) {
                return res.status(404).json({
                    error: 'Player not found',
                    _links: { collection: '/api/v1/players' }
                });
            }

            const etag = `"player-${player._id}"`;
            if (req.headers['if-none-match'] === etag) {
                return res.status(304).end();
            }

            res.setHeader('X-Resource-Type', 'Player');
            res.setHeader('Last-Modified', player.updatedAt.toUTCString());
            res.setHeader('ETag', etag);

            res.status(200).json({
                data: player,
                _links: {
                    self: `/api/v1/players/${player._id}`,
                    stats: player.stats ? `/api/v1/player-stats/${player.stats}` : null,
                    currentContract: player.currentContract ? `/api/v1/contracts/${player.currentContract}` : null,
                    contractsHistory: player.contractsHistory?.map(contract =>
                        `/api/v1/contracts/${contract._id}`
                    ),
                    collection: '/api/v1/players'
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/players' }
            });
        }
});

// POST /api/v1/players
playersRouter.post('/',
    validateAllowedFields(ALLOWED_FIELDS),
    validateReferences,
    async (req, res) => {
        try {
            const newPlayer = new Player(req.body);
            await newPlayer.save();

            res.setHeader('Location', `/api/v1/players/${newPlayer._id}`);
            res.setHeader('X-Resource-Type', 'Player');
            res.setHeader('X-Resource-Id', newPlayer._id.toString());

            res.status(201).json({
                data: newPlayer,
                _links: {
                    self: `/api/v1/players/${newPlayer._id}`,
                    collection: '/api/v1/players'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/players' }
                });
            }
            if (error.code === 11000) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Jersey number is already taken',
                    _links: { collection: '/api/v1/players' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/players' }
            });
        }
});

// PUT /api/v1/players/:playerId
playersRouter.put('/:playerId',
    validateObjectId('playerId'),
    validateAllowedFields(ALLOWED_FIELDS),
    validateReferences,
    async (req, res) => {
        try {
            const player = await Player.findByIdAndUpdate(
                req.params.playerId,
                req.body,
                { new: true, runValidators: true }
            )
                .populate('stats')
                .populate('currentContract')
                .populate('contractsHistory');

            if (!player) {
                return res.status(404).json({
                    error: 'Player not found',
                    _links: { collection: '/api/v1/players' }
                });
            }

            res.setHeader('X-Resource-Type', 'Player');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', player._id.toString());

            res.status(200).json({
                data: player,
                _links: {
                    self: `/api/v1/players/${player._id}`,
                    stats: player.stats ? `/api/v1/player-stats/${player.stats}` : null,
                    currentContract: player.currentContract ? `/api/v1/contracts/${player.currentContract}` : null,
                    contractsHistory: player.contractsHistory?.map(contract =>
                        `/api/v1/contracts/${contract._id}`
                    ),
                    collection: '/api/v1/players'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/players' }
                });
            }
            if (error.code === 11000) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Jersey number is already taken',
                    _links: { collection: '/api/v1/players' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/players' }
            });
        }
});

// PATCH /api/v1/players/:playerId
playersRouter.patch('/:playerId',
    validateObjectId('playerId'),
    validateAllowedFields(ALLOWED_FIELDS),
    validateReferences,
    async (req, res) => {
        try {
            const player = await Player.findByIdAndUpdate(
                req.params.playerId,
                { $set: req.body },
                { new: true, runValidators: true }
            )
                .populate('stats')
                .populate('currentContract')
                .populate('contractsHistory');

            if (!player) {
                return res.status(404).json({
                    error: 'Player not found',
                    _links: { collection: '/api/v1/players' }
                });
            }

            res.setHeader('X-Resource-Type', 'Player');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', player._id.toString());

            res.status(200).json({
                data: player,
                _links: {
                    self: `/api/v1/players/${player._id}`,
                    stats: player.stats ? `/api/v1/player-stats/${player.stats}` : null,
                    currentContract: player.currentContract ? `/api/v1/contracts/${player.currentContract}` : null,
                    contractsHistory: player.contractsHistory?.map(contract =>
                        `/api/v1/contracts/${contract._id}`
                    ),
                    collection: '/api/v1/players'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/players' }
                });
            }
            if (error.code === 11000) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Jersey number is already taken',
                    _links: { collection: '/api/v1/players' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/players' }
            });
        }
});

// DELETE /api/v1/players/:playerId
playersRouter.delete('/:playerId',
    validateObjectId('playerId'),
    async (req, res) => {
        try {
            const player = await Player.findByIdAndDelete(req.params.playerId);

            if (!player) {
                return res.status(404).json({
                    error: 'Player not found',
                    _links: { collection: '/api/v1/players' }
                });
            }

            res.setHeader('X-Resource-Type', 'Player');
            res.setHeader('X-Resource-Id', player._id.toString());
            res.setHeader('X-Deleted-At', new Date().toUTCString());

            res.status(204).end();
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/players' }
            });
        }
});