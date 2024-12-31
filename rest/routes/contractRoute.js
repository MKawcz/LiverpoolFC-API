import express from 'express';
import { Contract } from '../models/Contract.js';
import { validateObjectId, validateAllowedFields } from '../middleware/validators.js';

export const contractRouter = express.Router();

const ALLOWED_FIELDS = [
    'start', 'end',
    'salary.base', 'salary.currency',
    'bonuses'
];

// GET /api/v1/contracts
contractRouter.get('/', async (req, res) => {
    try {
        const contracts = await Contract.find();

        // Custom headers
        res.setHeader('X-Total-Count', contracts.length);
        res.setHeader('X-Resource-Type', 'Contract');
        res.setHeader('Last-Modified', new Date().toUTCString());

        if (contracts.length === 0) {
            return res.status(204).end();
        }

        res.status(200).json({
            data: contracts.map(contract => ({
                ...contract.toObject(),
                _links: {
                    self: `/api/v1/contracts/${contract._id}`
                }
            })),
            _links: {
                self: '/api/v1/contracts'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { self: '/api/v1/contracts' }
        });
    }
});

// GET /api/v1/contracts/:contractId
contractRouter.get('/:contractId', validateObjectId('contractId'), async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.contractId);

        if (!contract) {
            return res.status(404).json({
                error: 'Contract not found',
                _links: { collection: '/api/v1/contracts' }
            });
        }

        const etag = `"contract-${contract._id}"`;
        if (req.headers['if-none-match'] === etag) {
            return res.status(304).end();
        }

        // Custom headers
        res.setHeader('X-Resource-Type', 'Contract');
        res.setHeader('Last-Modified', contract.updatedAt.toUTCString());
        res.setHeader('ETag', etag);

        res.status(200).json({
            data: contract,
            _links: {
                self: `/api/v1/contracts/${contract._id}`,
                collection: '/api/v1/contracts'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { collection: '/api/v1/contracts' }
        });
    }
});

// POST /api/v1/contracts
contractRouter.post('/', validateAllowedFields(ALLOWED_FIELDS), async (req, res) => {
    try {
        const newContract = new Contract(req.body);
        await newContract.save();

        // Custom headers
        res.setHeader('Location', `/api/v1/contracts/${newContract._id}`);
        res.setHeader('X-Resource-Type', 'Contract');
        res.setHeader('X-Resource-Id', newContract._id.toString());

        res.status(201).json({
            data: newContract,
            _links: {
                self: `/api/v1/contracts/${newContract._id}`,
                collection: '/api/v1/contracts'
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation Error',
                message: error.message,
                _links: { collection: '/api/v1/contracts' }
            });
        }
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { collection: '/api/v1/contracts' }
        });
    }
});

// PUT /api/v1/contracts/:contractId
contractRouter.put('/:contractId',
    validateObjectId('contractId'),
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const contract = await Contract.findByIdAndUpdate(
                req.params.contractId,
                req.body,
                { new: true, runValidators: true }
            );

            if (!contract) {
                return res.status(404).json({
                    error: 'Contract not found',
                    _links: { collection: '/api/v1/contracts' }
                });
            }

            // Custom headers
            res.setHeader('X-Resource-Type', 'Contract');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', contract._id.toString());

            res.status(200).json({
                data: contract,
                _links: {
                    self: `/api/v1/contracts/${contract._id}`,
                    collection: '/api/v1/contracts'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/contracts' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/contracts' }
            });
        }
    });

// PATCH /api/v1/contracts/:contractId
contractRouter.patch('/:contractId',
    validateObjectId('contractId'),
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const contract = await Contract.findByIdAndUpdate(
                req.params.contractId,
                { $set: req.body },
                { new: true, runValidators: true }
            );

            if (!contract) {
                return res.status(404).json({
                    error: 'Contract not found',
                    _links: { collection: '/api/v1/contracts' }
                });
            }

            // Custom headers
            res.setHeader('X-Resource-Type', 'Contract');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', contract._id.toString());

            res.status(200).json({
                data: contract,
                _links: {
                    self: `/api/v1/contracts/${contract._id}`,
                    collection: '/api/v1/contracts'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/contracts' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/contracts' }
            });
        }
    });

// DELETE /api/v1/contracts/:contractId
contractRouter.delete('/:contractId', validateObjectId('contractId'), async (req, res) => {
    try {
        const contract = await Contract.findByIdAndDelete(req.params.contractId);

        if (!contract) {
            return res.status(404).json({
                error: 'Contract not found',
                _links: { collection: '/api/v1/contracts' }
            });
        }

        // Custom headers
        res.setHeader('X-Resource-Type', 'Contract');
        res.setHeader('X-Resource-Id', contract._id.toString());
        res.setHeader('X-Deleted-At', new Date().toUTCString());

        res.status(204).end();
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { collection: '/api/v1/contracts' }
        });
    }
});