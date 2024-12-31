import express from 'express';
import { Stadium } from '../models/Stadium.js';
import { validateObjectId, validateAllowedFields } from '../middleware/validators.js';

export const stadiumsRouter = express.Router();

// Definiujemy dozwolone pola dla stadionu
const ALLOWED_FIELDS = ['name', 'capacity', 'location'];

// GET /api/v1/stadiums
stadiumsRouter.get('/', async (req, res) => {
    try {
        const stadiums = await Stadium.find();

        res.setHeader('X-Total-Count', stadiums.length);
        res.setHeader('X-Resource-Type', 'Stadium');
        res.setHeader('Last-Modified', new Date().toUTCString());

        if (stadiums.length === 0) {
            return res.status(204).end();
        }

        res.status(200).json({
            data: stadiums.map(stadium => ({
                ...stadium.toObject(),
                _links: {
                    self: `/api/v1/stadiums/${stadium._id}`,
                    collection: '/api/v1/stadiums'
                }
            }))
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { self: '/api/v1/stadiums' }
        });
    }
});

// GET /api/v1/stadiums/:stadiumId
stadiumsRouter.get('/:stadiumId',
    validateObjectId('stadiumId'),
    async (req, res) => {
        try {
            const stadium = await Stadium.findById(req.params.stadiumId);

            if (!stadium) {
                return res.status(404).json({
                    error: 'Stadium not found',
                    _links: { collection: '/api/v1/stadiums' }
                });
            }

            const etag = `"stadium-${stadium._id}"`;
            if (req.headers['if-none-match'] === etag) {
                return res.status(304).end();
            }

            res.setHeader('X-Resource-Type', 'Stadium');
            res.setHeader('Last-Modified', stadium.updatedAt.toUTCString());
            res.setHeader('ETag', etag);

            res.status(200).json({
                data: stadium,
                _links: {
                    self: `/api/v1/stadiums/${stadium._id}`,
                    collection: '/api/v1/stadiums'
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/stadiums' }
            });
        }
});

// POST /api/v1/stadiums
stadiumsRouter.post('/',
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const newStadium = new Stadium(req.body);
            await newStadium.save();

            res.setHeader('Location', `/api/v1/stadiums/${newStadium._id}`);
            res.setHeader('X-Resource-Type', 'Stadium');
            res.setHeader('X-Resource-Id', newStadium._id.toString());

            res.status(201).json({
                data: newStadium,
                _links: {
                    self: `/api/v1/stadiums/${newStadium._id}`,
                    collection: '/api/v1/stadiums'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/stadiums' }
                });
            }
            if (error.code === 11000) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Stadium with this name already exists',
                    _links: { collection: '/api/v1/stadiums' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/stadiums' }
            });
        }
});

// PUT /api/v1/stadiums/:stadiumId
stadiumsRouter.put('/:stadiumId',
    validateObjectId('stadiumId'),
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const stadium = await Stadium.findByIdAndUpdate(
                req.params.stadiumId,
                req.body,
                { new: true, runValidators: true }
            );

            if (!stadium) {
                return res.status(404).json({
                    error: 'Stadium not found',
                    _links: { collection: '/api/v1/stadiums' }
                });
            }

            res.setHeader('X-Resource-Type', 'Stadium');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', stadium._id.toString());

            res.status(200).json({
                data: stadium,
                _links: {
                    self: `/api/v1/stadiums/${stadium._id}`,
                    collection: '/api/v1/stadiums'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/stadiums' }
                });
            }
            if (error.code === 11000) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Stadium with this name already exists',
                    _links: { collection: '/api/v1/stadiums' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/stadiums' }
            });
        }
});

// PATCH /api/v1/stadiums/:stadiumId
stadiumsRouter.patch('/:stadiumId',
    validateObjectId('stadiumId'),
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const stadium = await Stadium.findByIdAndUpdate(
                req.params.stadiumId,
                { $set: req.body },
                { new: true, runValidators: true }
            );

            if (!stadium) {
                return res.status(404).json({
                    error: 'Stadium not found',
                    _links: { collection: '/api/v1/stadiums' }
                });
            }

            res.setHeader('X-Resource-Type', 'Stadium');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', stadium._id.toString());

            res.status(200).json({
                data: stadium,
                _links: {
                    self: `/api/v1/stadiums/${stadium._id}`,
                    collection: '/api/v1/stadiums'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/stadiums' }
                });
            }
            if (error.code === 11000) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Stadium with this name already exists',
                    _links: { collection: '/api/v1/stadiums' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/stadiums' }
            });
        }
});

// DELETE /api/v1/stadiums/:stadiumId
stadiumsRouter.delete('/:stadiumId',
    validateObjectId('stadiumId'),
    async (req, res) => {
        try {
            const stadium = await Stadium.findByIdAndDelete(req.params.stadiumId);

            if (!stadium) {
                return res.status(404).json({
                    error: 'Stadium not found',
                    _links: { collection: '/api/v1/stadiums' }
                });
            }

            res.setHeader('X-Resource-Type', 'Stadium');
            res.setHeader('X-Resource-Id', stadium._id.toString());
            res.setHeader('X-Deleted-At', new Date().toUTCString());

            res.status(204).end();
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/stadiums' }
            });
        }
});