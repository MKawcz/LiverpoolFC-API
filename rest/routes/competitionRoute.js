import express from 'express';
import { Competition } from '../models/Competition.js';
import { validateObjectId, validateAllowedFields } from '../middleware/validators.js';

export const competitionRouter = express.Router();

const ALLOWED_FIELDS = ['name', 'type', 'yearOfCreation'];

// GET /api/v1/competitions
competitionRouter.get('/', async (req, res) => {
    try {
        const competitions = await Competition.find();

        // Custom headers
        res.setHeader('X-Total-Count', competitions.length);
        res.setHeader('X-Resource-Type', 'Competition');
        res.setHeader('Last-Modified', new Date().toUTCString());

        if (competitions.length === 0) {
            return res.status(204).end();
        }

        res.status(200).json({
            data: competitions.map(competition => ({
                ...competition.toObject(),
                _links: {
                    self: `/api/v1/competitions/${competition._id}`
                }
            })),
            _links: {
                self: '/api/v1/competitions'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { self: '/api/v1/competitions' }
        });
    }
});

// GET /api/v1/competitions/:competitionId
competitionRouter.get('/:competitionId', validateObjectId('competitionId'), async (req, res) => {
    try {
        const competition = await Competition.findById(req.params.competitionId);

        if (!competition) {
            return res.status(404).json({
                error: 'Competition not found',
                _links: { collection: '/api/v1/competitions' }
            });
        }

        const etag = `"competition-${competition._id}"`;
        if (req.headers['if-none-match'] === etag) {
            return res.status(304).end();
        }

        // Custom headers
        res.setHeader('X-Resource-Type', 'Competition');
        res.setHeader('Last-Modified', competition.updatedAt.toUTCString());
        res.setHeader('ETag', etag);

        res.status(200).json({
            data: competition,
            _links: {
                self: `/api/v1/competitions/${competition._id}`,
                collection: '/api/v1/competitions'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { collection: '/api/v1/competitions' }
        });
    }
});

// POST /api/v1/competitions
competitionRouter.post(
    '/',
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const newCompetition = new Competition(req.body);
            await newCompetition.save();

            // Custom headers
            res.setHeader('Location', `/api/v1/competitions/${newCompetition._id}`);
            res.setHeader('X-Resource-Type', 'Competition');
            res.setHeader('X-Resource-Id', newCompetition._id.toString());

            res.status(201).json({
                data: newCompetition,
                _links: {
                    self: `/api/v1/competitions/${newCompetition._id}`,
                    collection: '/api/v1/competitions'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/competitions' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/competitions' }
            });
        }
});

// PUT /api/v1/competitions/:competitionId
competitionRouter.put('/:competitionId',
    validateObjectId('competitionId'),
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const competition = await Competition.findByIdAndUpdate(
                req.params.competitionId,
                req.body,
                { new: true, runValidators: true }
            );

            if (!competition) {
                return res.status(404).json({
                    error: 'Competition not found',
                    _links: { collection: '/api/v1/competitions' }
                });
            }

            // Custom headers
            res.setHeader('X-Resource-Type', 'Competition');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', competition._id.toString());

            res.status(200).json({
                data: competition,
                _links: {
                    self: `/api/v1/competitions/${competition._id}`,
                    collection: '/api/v1/competitions'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/competitions' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/competitions' }
            });
        }
});

competitionRouter.patch('/:competitionId',
    validateObjectId('competitionId'),
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const competition = await Competition.findByIdAndUpdate(
                req.params.competitionId,
                { $set: req.body },
                { new: true, runValidators: true }
            );

            if (!competition) {
                return res.status(404).json({
                    error: 'Competition not found',
                    _links: { collection: '/api/v1/competitions' }
                });
            }

            res.setHeader('X-Resource-Type', 'Competition');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', competition._id.toString());

            res.status(200).json({
                data: competition,
                _links: {
                    self: `/api/v1/competitions/${competition._id}`,
                    collection: '/api/v1/competitions'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/competitions' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/competitions' }
            });
        }
});

// DELETE /api/v1/competitions/:competitionId
competitionRouter.delete('/:competitionId', validateObjectId('competitionId'), async (req, res) => {
    try {
        const competition = await Competition.findByIdAndDelete(req.params.competitionId);

        if (!competition) {
            return res.status(404).json({
                error: 'Competition not found',
                _links: { collection: '/api/v1/competitions' }
            });
        }

        // Custom headers
        res.setHeader('X-Resource-Type', 'Competition');
        res.setHeader('X-Resource-Id', competition._id.toString());
        res.setHeader('X-Deleted-At', new Date().toUTCString());

        res.status(204).end();
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { collection: '/api/v1/competitions' }
        });
    }
});