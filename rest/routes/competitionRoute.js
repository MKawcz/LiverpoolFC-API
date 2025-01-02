/**
 * @swagger
 * components:
 *   schemas:
 *     Competition:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - yearOfCreation
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Competition name (must be unique)
 *         type:
 *           type: string
 *           enum: [LEAGUE, CUP, FRIENDLY]
 *           description: Competition type
 *         yearOfCreation:
 *           type: number
 *           minimum: 1800
 *           description: Year when competition was created (cannot be in future)
 *   responses:
 *     CompetitionResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/Competition'
 *         _links:
 *           type: object
 *           properties:
 *             self:
 *               type: string
 *             collection:
 *               type: string
 */

import express from 'express';
import { Competition } from '../models/Competition.js';
import { validateObjectId, validateAllowedFields } from '../middleware/validators.js';

export const competitionRouter = express.Router();

const ALLOWED_FIELDS = ['name', 'type', 'yearOfCreation'];

/**
 * @swagger
 * /competitions:
 *   get:
 *     summary: Get all competitions
 *     tags: [Competitions]
 *     responses:
 *       200:
 *         description: List of competitions
 *         headers:
 *           X-Total-Count:
 *             description: Total number of competitions
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
 *                     $ref: '#/components/schemas/Competition'
 *       204:
 *         description: No competitions found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /competitions/{id}:
 *   get:
 *     summary: Get competition by ID
 *     tags: [Competitions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *     responses:
 *       200:
 *         description: Competition found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/CompetitionResponse'
 *       304:
 *         description: Not modified (ETag matched)
 *       404:
 *         description: Competition not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /competitions:
 *   post:
 *     summary: Create new competition
 *     tags: [Competitions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Competition'
 *     responses:
 *       201:
 *         description: Competition created
 *         headers:
 *           Location:
 *             description: URL of created competition
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/CompetitionResponse'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /competitions/{id}:
 *   put:
 *     summary: Update competition
 *     tags: [Competitions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Competition'
 *     responses:
 *       200:
 *         description: Competition updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/CompetitionResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Competition not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /competitions/{id}:
 *   patch:
 *     summary: Partially update competition
 *     tags: [Competitions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               yearOfCreation:
 *                 type: number
 *     responses:
 *       200:
 *         description: Competition updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/CompetitionResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Competition not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /competitions/{id}:
 *   delete:
 *     summary: Delete competition
 *     tags: [Competitions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *     responses:
 *       204:
 *         description: Competition deleted
 *       404:
 *         description: Competition not found
 *       500:
 *         description: Server error
 */
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