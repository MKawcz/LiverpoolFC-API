/**
 * @swagger
 * components:
 *   schemas:
 *     Prizes:
 *       type: object
 *       required:
 *         - winner
 *       properties:
 *         winner:
 *           type: number
 *           minimum: 0
 *           description: Prize money for winner
 *         runnerUp:
 *           type: number
 *           minimum: 0
 *           description: Prize money for runner-up (optional)
 *         thirdPlace:
 *           type: number
 *           minimum: 0
 *           description: Prize money for third place (optional)
 *
 *     Trophy:
 *       type: object
 *       required:
 *         - competition
 *         - wonDate
 *         - prizes
 *       properties:
 *         competition:
 *           type: string
 *           format: objectId
 *           description: Reference to Competition model
 *         wonDate:
 *           type: string
 *           format: date-time
 *           description: Date when trophy was won (cannot be in future)
 *         prizes:
 *           $ref: '#/components/schemas/Prizes'
 *
 *   responses:
 *     TrophyResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/Trophy'
 *         _links:
 *           type: object
 *           properties:
 *             self:
 *               type: string
 *             collection:
 *               type: string
 *             competition:
 *               type: string
 */

import express from 'express';
import { Trophy } from '../models/Trophy.js';
import { validateObjectId, validateAllowedFields, createReferenceValidator } from '../middleware/validators.js';

export const trophiesRouter = express.Router();

const ALLOWED_FIELDS = [
    'competition', 'wonDate',
    'prizes.winner', 'prizes.runnerUp', 'prizes.thirdPlace'
];
const validateTrophyReferences = createReferenceValidator('Trophy');

/**
 * @swagger
 * /trophies:
 *   get:
 *     summary: Get all trophies
 *     tags: [Trophies]
 *     responses:
 *       200:
 *         description: List of trophies
 *         headers:
 *           X-Total-Count:
 *             description: Total number of trophies
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
 *                     $ref: '#/components/schemas/Trophy'
 *       204:
 *         description: No trophies found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /trophies/{id}:
 *   get:
 *     summary: Get trophy by ID
 *     tags: [Trophies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trophy ID
 *     responses:
 *       200:
 *         description: Trophy found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/TrophyResponse'
 *       304:
 *         description: Not modified (ETag matched)
 *       404:
 *         description: Trophy not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /trophies:
 *   post:
 *     summary: Create new trophy
 *     tags: [Trophies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Trophy'
 *     responses:
 *       201:
 *         description: Trophy created
 *         headers:
 *           Location:
 *             description: URL of created trophy
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/TrophyResponse'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
trophiesRouter.post('/',
    validateAllowedFields(ALLOWED_FIELDS),
    validateTrophyReferences,
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

/**
 * @swagger
 * /trophies/{id}:
 *   put:
 *     summary: Update trophy
 *     tags: [Trophies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trophy ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Trophy'
 *     responses:
 *       200:
 *         description: Trophy updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/TrophyResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Trophy not found
 *       500:
 *         description: Server error
 */
trophiesRouter.put('/:trophyId',
    validateObjectId('trophyId'),
    validateAllowedFields(ALLOWED_FIELDS),
    validateTrophyReferences,
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

/**
 * @swagger
 * /trophies/{id}:
 *   patch:
 *     summary: Partially update trophy
 *     tags: [Trophies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trophy ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               competition:
 *                 type: string
 *                 format: objectId
 *               wonDate:
 *                 type: string
 *                 format: date-time
 *               prizes:
 *                 type: object
 *                 properties:
 *                   winner:
 *                     type: number
 *                     minimum: 0
 *                   runnerUp:
 *                     type: number
 *                     minimum: 0
 *                   thirdPlace:
 *                     type: number
 *                     minimum: 0
 *     responses:
 *       200:
 *         description: Trophy updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/TrophyResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Trophy not found
 *       500:
 *         description: Server error
 */
trophiesRouter.patch('/:trophyId',
    validateObjectId('trophyId'),
    validateAllowedFields(ALLOWED_FIELDS),
    validateTrophyReferences,
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

/**
 * @swagger
 * /trophies/{id}:
 *   delete:
 *     summary: Delete trophy
 *     tags: [Trophies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trophy ID
 *     responses:
 *       204:
 *         description: Trophy deleted
 *       404:
 *         description: Trophy not found
 *       500:
 *         description: Server error
 */
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