import express from 'express';
import { Manager } from '../models/Manager.js';
import { validateObjectId, validateAllowedFields } from '../middleware/validators.js';

export const managersRouter = express.Router();

// Definiujemy dozwolone pola na podstawie schematu
const ALLOWED_FIELDS = [
    'name',
    'nationality',
    'dateOfBirth',
    'licenses',
    'status'
];

// GET /api/v1/managers
managersRouter.get('/', async (req, res) => {
    try {
        const managers = await Manager.find();

        // Custom headers
        res.setHeader('X-Total-Count', managers.length);
        res.setHeader('X-Resource-Type', 'Manager');
        res.setHeader('Last-Modified', new Date().toUTCString());

        if (managers.length === 0) {
            return res.status(204).end();
        }

        res.status(200).json({
            data: managers.map(manager => ({
                ...manager.toObject(),
                _links: {
                    self: `/api/v1/managers/${manager._id}`,
                    collection: '/api/v1/managers'
                }
            })),
            _links: {
                self: '/api/v1/managers'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { self: '/api/v1/managers' }
        });
    }
});

// GET /api/v1/managers/:managerId
managersRouter.get('/:managerId', validateObjectId('managerId'), async (req, res) => {
    try {
        const manager = await Manager.findById(req.params.managerId);

        if (!manager) {
            return res.status(404).json({
                error: 'Manager not found',
                _links: { collection: '/api/v1/managers' }
            });
        }

        const etag = `"manager-${manager._id}"`;
        if (req.headers['if-none-match'] === etag) {
            return res.status(304).end();
        }

        // Custom headers
        res.setHeader('X-Resource-Type', 'Manager');
        res.setHeader('Last-Modified', manager.updatedAt.toUTCString());
        res.setHeader('ETag', etag);

        res.status(200).json({
            data: manager,
            _links: {
                self: `/api/v1/managers/${manager._id}`,
                collection: '/api/v1/managers'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { collection: '/api/v1/managers' }
        });
    }
});

// POST /api/v1/managers
managersRouter.post('/',
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const newManager = new Manager(req.body);
            await newManager.save();

            // Custom headers
            res.setHeader('Location', `/api/v1/managers/${newManager._id}`);
            res.setHeader('X-Resource-Type', 'Manager');
            res.setHeader('X-Resource-Id', newManager._id.toString());

            res.status(201).json({
                data: newManager,
                _links: {
                    self: `/api/v1/managers/${newManager._id}`,
                    collection: '/api/v1/managers'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/managers' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/managers' }
            });
        }
    });

// PUT /api/v1/managers/:managerId
managersRouter.put('/:managerId',
    validateObjectId('managerId'),
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const manager = await Manager.findByIdAndUpdate(
                req.params.managerId,
                req.body,
                { new: true, runValidators: true }
            );

            if (!manager) {
                return res.status(404).json({
                    error: 'Manager not found',
                    _links: { collection: '/api/v1/managers' }
                });
            }

            // Custom headers
            res.setHeader('X-Resource-Type', 'Manager');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', manager._id.toString());

            res.status(200).json({
                data: manager,
                _links: {
                    self: `/api/v1/managers/${manager._id}`,
                    collection: '/api/v1/managers'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/managers' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/managers' }
            });
        }
    });

// PATCH /api/v1/managers/:managerId
managersRouter.patch('/:managerId',
    validateObjectId('managerId'),
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const manager = await Manager.findByIdAndUpdate(
                req.params.managerId,
                { $set: req.body },
                { new: true, runValidators: true }
            );

            if (!manager) {
                return res.status(404).json({
                    error: 'Manager not found',
                    _links: { collection: '/api/v1/managers' }
                });
            }

            // Custom headers
            res.setHeader('X-Resource-Type', 'Manager');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', manager._id.toString());

            res.status(200).json({
                data: manager,
                _links: {
                    self: `/api/v1/managers/${manager._id}`,
                    collection: '/api/v1/managers'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/managers' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/managers' }
            });
        }
    });

// DELETE /api/v1/managers/:managerId
managersRouter.delete('/:managerId', validateObjectId('managerId'), async (req, res) => {
    try {
        const manager = await Manager.findByIdAndDelete(req.params.managerId);

        if (!manager) {
            return res.status(404).json({
                error: 'Manager not found',
                _links: { collection: '/api/v1/managers' }
            });
        }

        // Custom headers
        res.setHeader('X-Resource-Type', 'Manager');
        res.setHeader('X-Resource-Id', manager._id.toString());
        res.setHeader('X-Deleted-At', new Date().toUTCString());

        res.status(204).end();
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { collection: '/api/v1/managers' }
        });
    }
});