import express from 'express';
import { Trophy } from '../models/Trophy.js';
import { Competition } from '../models/Competition.js';
import { validateObjectId, validateAllowedFields } from '../middleware/validators.js';

export const trophiesRouter = express.Router();

// Definiujemy dozwolone pola, uwzględniając strukturę zagnieżdżoną
const ALLOWED_FIELDS = [
    'competition', 'wonDate',
    'prizes.winner', 'prizes.runnerUp', 'prizes.thirdPlace',
    'bonuses.forWinning', 'bonuses.forDrawing', 'bonuses.forCleanSheet'
];

// Middleware do walidacji referencji konkurencji
const validateCompetitionReference = async (req, res, next) => {
    try {
        if (req.body.competition) {
            const competitionExists = await Competition.findById(req.body.competition);
            if (!competitionExists) {
                return res.status(400).json({
                    error: 'Invalid Reference',
                    message: 'Competition does not exist',
                    _links: { collection: '/api/v1/trophies' }
                });
            }
        }
        next();
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/trophies
trophiesRouter.get('/', async (req, res) => {
    try {
        const trophies = await Trophy.find()
            .populate('competition', 'name type');

        res.setHeader('X-Total-Count', trophies.length);
        res.setHeader('X-Resource-Type', 'Trophy');
        res.setHeader('Last-Modified', new Date().toUTCString());

        if (trophies.length === 0) {
            return res.status(204).end();
        }

        res.status(200).json({
            data: trophies.map(trophy => ({
                ...trophy.toObject(),
                _links: {
                    self: `/api/v1/trophies/${trophy._id}`,
                    competition: `/api/v1/competitions/${trophy.competition._id}`,
                    collection: '/api/v1/trophies'
                }
            }))
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { self: '/api/v1/trophies' }
        });
    }
});

// GET /api/v1/trophies/:trophyId
trophiesRouter.get('/:trophyId',
    validateObjectId('trophyId'),
    async (req, res) => {
        try {
            const trophy = await Trophy.findById(req.params.trophyId)
                .populate('competition', 'name type');

            if (!trophy) {
                return res.status(404).json({
                    error: 'Trophy not found',
                    _links: { collection: '/api/v1/trophies' }
                });
            }

            const etag = `"trophy-${trophy._id}"`;
            if (req.headers['if-none-match'] === etag) {
                return res.status(304).end();
            }

            res.setHeader('X-Resource-Type', 'Trophy');
            res.setHeader('Last-Modified', trophy.updatedAt.toUTCString());
            res.setHeader('ETag', etag);

            res.status(200).json({
                data: trophy,
                _links: {
                    self: `/api/v1/trophies/${trophy._id}`,
                    competition: `/api/v1/competitions/${trophy.competition._id}`,
                    collection: '/api/v1/trophies'
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/trophies' }
            });
        }
});

// POST /api/v1/trophies
trophiesRouter.post('/',
    validateAllowedFields(ALLOWED_FIELDS),
    validateCompetitionReference,
    async (req, res) => {
        try {
            const newTrophy = new Trophy(req.body);
            await newTrophy.save();

            res.setHeader('Location', `/api/v1/trophies/${newTrophy._id}`);
            res.setHeader('X-Resource-Type', 'Trophy');
            res.setHeader('X-Resource-Id', newTrophy._id.toString());

            res.status(201).json({
                data: newTrophy,
                _links: {
                    self: `/api/v1/trophies/${newTrophy._id}`,
                    competition: `/api/v1/competitions/${newTrophy.competition}`,
                    collection: '/api/v1/trophies'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/trophies' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/trophies' }
            });
        }
});

// PUT /api/v1/trophies/:trophyId
trophiesRouter.put('/:trophyId',
    validateObjectId('trophyId'),
    validateAllowedFields(ALLOWED_FIELDS),
    validateCompetitionReference,
    async (req, res) => {
        try {
            const trophy = await Trophy.findByIdAndUpdate(
                req.params.trophyId,
                req.body,
                { new: true, runValidators: true }
            ).populate('competition', 'name type');

            if (!trophy) {
                return res.status(404).json({
                    error: 'Trophy not found',
                    _links: { collection: '/api/v1/trophies' }
                });
            }

            res.setHeader('X-Resource-Type', 'Trophy');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', trophy._id.toString());

            res.status(200).json({
                data: trophy,
                _links: {
                    self: `/api/v1/trophies/${trophy._id}`,
                    competition: `/api/v1/competitions/${trophy.competition._id}`,
                    collection: '/api/v1/trophies'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/trophies' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/trophies' }
            });
        }
});

// PATCH /api/v1/trophies/:trophyId
trophiesRouter.patch('/:trophyId',
    validateObjectId('trophyId'),
    validateAllowedFields(ALLOWED_FIELDS),
    validateCompetitionReference,
    async (req, res) => {
        try {
            const trophy = await Trophy.findByIdAndUpdate(
                req.params.trophyId,
                { $set: req.body },
                { new: true, runValidators: true }
            ).populate('competition', 'name type');

            if (!trophy) {
                return res.status(404).json({
                    error: 'Trophy not found',
                    _links: { collection: '/api/v1/trophies' }
                });
            }

            res.setHeader('X-Resource-Type', 'Trophy');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', trophy._id.toString());

            res.status(200).json({
                data: trophy,
                _links: {
                    self: `/api/v1/trophies/${trophy._id}`,
                    competition: `/api/v1/competitions/${trophy.competition._id}`,
                    collection: '/api/v1/trophies'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/trophies' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/trophies' }
            });
        }
});

// DELETE /api/v1/trophies/:trophyId
trophiesRouter.delete('/:trophyId',
    validateObjectId('trophyId'),
    async (req, res) => {
        try {
            const trophy = await Trophy.findByIdAndDelete(req.params.trophyId);

            if (!trophy) {
                return res.status(404).json({
                    error: 'Trophy not found',
                    _links: { collection: '/api/v1/trophies' }
                });
            }

            res.setHeader('X-Resource-Type', 'Trophy');
            res.setHeader('X-Resource-Id', trophy._id.toString());
            res.setHeader('X-Deleted-At', new Date().toUTCString());

            res.status(204).end();
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/trophies' }
            });
        }
});