/**
 * @swagger
 * components:
 *   schemas:
 *     Stadium:
 *       type: object
 *       required:
 *         - name
 *         - capacity
 *         - location
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Stadium name (must be unique)
 *         capacity:
 *           type: number
 *           minimum: 100
 *           description: Stadium capacity (minimum 100 seats)
 *         location:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Stadium location
 *
 *   responses:
 *     StadiumResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/Stadium'
 *         _links:
 *           type: object
 *           properties:
 *             self:
 *               type: string
 *             collection:
 *               type: string
 */

import express from 'express';
import { Stadium } from '../models/Stadium.js';
import { validateObjectId, validateAllowedFields } from '../middleware/validators.js';

export const stadiumsRouter = express.Router();

// Definiujemy dozwolone pola dla stadionu
const ALLOWED_FIELDS = ['name', 'capacity', 'location'];

/**
 * @swagger
 * /stadiums:
 *   get:
 *     summary: Get all stadiums
 *     tags: [Stadiums]
 *     responses:
 *       200:
 *         description: List of stadiums
 *         headers:
 *           X-Total-Count:
 *             description: Total number of stadiums
 *             schema:
 *               type: integer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Stadium'
 *       404:
 *         description: No stadiums found
 *       500:
 *         description: Server error
 */
stadiumsRouter.get('/', async (req, res) => {
    try {
        const stadiums = await Stadium.find();

        res.setHeader('X-Total-Count', stadiums.length);
        res.setHeader('X-Resource-Type', 'Stadium');
        res.setHeader('Last-Modified', new Date().toUTCString());

        if (stadiums.length === 0) {
            return res.status(404).end();
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

/**
 * @swagger
 * /stadiums/{id}:
 *   get:
 *     summary: Get stadium by ID
 *     tags: [Stadiums]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stadium ID
 *     responses:
 *       200:
 *         description: Stadium found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/StadiumResponse'
 *       404:
 *         description: Stadium not found
 *       500:
 *         description: Server error
 */
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

            res.setHeader('X-Resource-Type', 'Stadium');
            res.setHeader('Last-Modified', stadium.updatedAt.toUTCString());

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

/**
 * @swagger
 * /stadiums:
 *   post:
 *     summary: Create new stadium
 *     tags: [Stadiums]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Stadium'
 *     responses:
 *       201:
 *         description: Stadium created
 *         headers:
 *           Location:
 *             description: URL of created stadium
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/StadiumResponse'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Stadium with this name already exists
 *       500:
 *         description: Server error
 */
stadiumsRouter.post('/',
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const newStadium = new Stadium(req.body);
            await newStadium.save();

            res.setHeader('Location', `/api/v1/stadiums/${newStadium._id}`);
            res.setHeader('X-Resource-Type', 'Stadium');

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

/**
 * @swagger
 * /stadiums/{id}:
 *   put:
 *     summary: Update stadium
 *     tags: [Stadiums]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stadium ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Stadium'
 *     responses:
 *       200:
 *         description: Stadium updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/StadiumResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Stadium not found
 *       409:
 *         description: Stadium with this name already exists
 *       500:
 *         description: Server error
 */
stadiumsRouter.put('/:stadiumId',
    validateObjectId('stadiumId'),
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const stadium = await Stadium.findById(req.params.stadiumId);

            if (!stadium) {
                return res.status(404).json({
                    error: 'Stadium not found',
                    _links: { collection: '/api/v1/stadiums' }
                });
            }

            Object.keys(stadium.toObject()).forEach(key => {
                if (key !== '_id' && key !== '__v') {
                    stadium[key] = undefined;
                }
            });

            Object.assign(stadium, req.body);
            await stadium.save();

            res.setHeader('X-Resource-Type', 'Stadium');
            res.setHeader('Last-Modified', new Date().toUTCString());

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

/**
 * @swagger
 * /stadiums/{id}:
 *   patch:
 *     summary: Partially update stadium
 *     tags: [Stadiums]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stadium ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               capacity:
 *                 type: number
 *                 minimum: 100
 *               location:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *     responses:
 *       200:
 *         description: Stadium updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/StadiumResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Stadium not found
 *       409:
 *         description: Stadium with this name already exists
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /stadiums/{id}:
 *   delete:
 *     summary: Delete stadium
 *     tags: [Stadiums]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stadium ID
 *     responses:
 *       204:
 *         description: Stadium deleted
 *       404:
 *         description: Stadium not found
 *       500:
 *         description: Server error
 */
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