/**
 * @swagger
 * components:
 *   schemas:
 *     Goals:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Total number of goals scored
 *         penalties:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Number of penalties scored
 *         freeKicks:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Number of free kicks scored
 *
 *     Cards:
 *       type: object
 *       properties:
 *         yellow:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Number of yellow cards received
 *         red:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Number of red cards received
 *
 *     PlayerStats:
 *       type: object
 *       required:
 *         - appearances
 *         - minutesPlayed
 *       properties:
 *         appearances:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Number of appearances made
 *         minutesPlayed:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Total minutes played
 *         goals:
 *           $ref: '#/components/schemas/Goals'
 *         assists:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Number of assists provided
 *         tackles:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Number of successful tackles
 *         interceptions:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Number of interceptions made
 *         clearances:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Number of clearances made
 *         cleanSheets:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Number of clean sheets kept
 *         saves:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Number of saves made
 *         cards:
 *           $ref: '#/components/schemas/Cards'
 *
 *   responses:
 *     PlayerStatsResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/PlayerStats'
 *         _links:
 *           type: object
 *           properties:
 *             self:
 *               type: string
 *             collection:
 *               type: string
 */

import express from 'express';
import { PlayerStats } from '../models/PlayerStats.js';
import { validateObjectId, validateAllowedFields } from '../middleware/validators.js';

export const playerStatsRouter = express.Router();

const ALLOWED_FIELDS = [
    'appearances', 'minutesPlayed',
    'goals', 'goals.total', 'goals.penalties', 'goals.freeKicks',
    'assists', 'tackles', 'interceptions',
    'clearances', 'cleanSheets', 'saves',
    'cards', 'cards.yellow', 'cards.red'
];

/**
 * @swagger
 * /player-stats:
 *   get:
 *     summary: Get all player stats
 *     tags: [PlayerStats]
 *     responses:
 *       200:
 *         description: List of player stats
 *         headers:
 *           X-Total-Count:
 *             description: Total number of player stats records
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
 *                     $ref: '#/components/schemas/PlayerStats'
 *       204:
 *         description: No player stats found
 *       500:
 *         description: Server error
 */
playerStatsRouter.get('/', async (req, res) => {
    try {
        const stats = await PlayerStats.find();

        res.setHeader('X-Total-Count', stats.length);
        res.setHeader('X-Resource-Type', 'PlayerStats');
        res.setHeader('Last-Modified', new Date().toUTCString());

        if (stats.length === 0) {
            return res.status(204).end();
        }

        res.status(200).json({
            data: stats.map(stat => ({
                ...stat.toObject(),
                _links: {
                    self: `/api/v1/player-stats/${stat._id}`,
                    collection: '/api/v1/player-stats'
                }
            })),
            _links: {
                self: '/api/v1/player-stats'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { self: '/api/v1/player-stats' }
        });
    }
});

/**
 * @swagger
 * /player-stats/{id}:
 *   get:
 *     summary: Get player stats by ID
 *     tags: [PlayerStats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PlayerStats ID
 *     responses:
 *       200:
 *         description: Player stats found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/PlayerStatsResponse'
 *       404:
 *         description: Player stats not found
 *       500:
 *         description: Server error
 */
playerStatsRouter.get('/:statsId',
    validateObjectId('statsId'),
    async (req, res) => {
        try {
            const stats = await PlayerStats.findById(req.params.statsId);

            if (!stats) {
                return res.status(404).json({
                    error: 'Player stats not found',
                    _links: { collection: '/api/v1/player-stats' }
                });
            }

            res.setHeader('X-Resource-Type', 'PlayerStats');
            res.setHeader('Last-Modified', stats.updatedAt?.toUTCString() || new Date().toUTCString());

            res.status(200).json({
                data: stats,
                _links: {
                    self: `/api/v1/player-stats/${stats._id}`,
                    collection: '/api/v1/player-stats'
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/player-stats' }
            });
        }
    });

/**
 * @swagger
 * /player-stats:
 *   post:
 *     summary: Create new player stats
 *     tags: [PlayerStats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlayerStats'
 *     responses:
 *       201:
 *         description: Player stats created
 *         headers:
 *           Location:
 *             description: URL of created player stats
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/PlayerStatsResponse'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
playerStatsRouter.post('/',
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const newStats = new PlayerStats(req.body);
            await newStats.save();

            res.setHeader('Location', `/api/v1/player-stats/${newStats._id}`);
            res.setHeader('X-Resource-Type', 'PlayerStats');

            res.status(201).json({
                data: newStats,
                _links: {
                    self: `/api/v1/player-stats/${newStats._id}`,
                    collection: '/api/v1/player-stats'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/player-stats' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/player-stats' }
            });
        }
    });

/**
 * @swagger
 * /player-stats/{id}:
 *   put:
 *     summary: Update player stats
 *     tags: [PlayerStats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PlayerStats ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlayerStats'
 *     responses:
 *       200:
 *         description: Player stats updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/PlayerStatsResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Player stats not found
 *       500:
 *         description: Server error
 */
playerStatsRouter.put('/:statsId',
    validateObjectId('statsId'),
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const stats = await PlayerStats.findById(req.params.statsId);

            if (!stats) {
                return res.status(404).json({
                    error: 'Player stats not found',
                    _links: { collection: '/api/v1/player-stats' }
                });
            }

            Object.keys(stats.toObject()).forEach(key => {
                if (key !== '_id' && key !== '__v') {
                    stats[key] = undefined;
                }
            });

            Object.assign(stats, req.body);
            await stats.save();

            res.setHeader('X-Resource-Type', 'PlayerStats');
            res.setHeader('Last-Modified', new Date().toUTCString());

            res.status(200).json({
                data: stats,
                _links: {
                    self: `/api/v1/player-stats/${stats._id}`,
                    collection: '/api/v1/player-stats'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/player-stats' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/player-stats' }
            });
        }
    });

/**
 * @swagger
 * /player-stats/{id}:
 *   patch:
 *     summary: Partially update player stats
 *     tags: [PlayerStats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PlayerStats ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appearances:
 *                 type: number
 *               minutesPlayed:
 *                 type: number
 *               goals:
 *                 type: object
 *                 properties:
 *                   total:
 *                     type: number
 *                   penalties:
 *                     type: number
 *                   freeKicks:
 *                     type: number
 *               assists:
 *                 type: number
 *               tackles:
 *                 type: number
 *               interceptions:
 *                 type: number
 *               clearances:
 *                 type: number
 *               cleanSheets:
 *                 type: number
 *               saves:
 *                 type: number
 *               cards:
 *                 type: object
 *                 properties:
 *                   yellow:
 *                     type: number
 *                   red:
 *                     type: number
 *     responses:
 *       200:
 *         description: Player stats updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/PlayerStatsResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Player stats not found
 *       500:
 *         description: Server error
 */
playerStatsRouter.patch('/:statsId',
    validateObjectId('statsId'),
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const stats = await PlayerStats.findByIdAndUpdate(
                req.params.statsId,
                { $set: req.body },
                { new: true, runValidators: true }
            );

            if (!stats) {
                return res.status(404).json({
                    error: 'Player stats not found',
                    _links: { collection: '/api/v1/player-stats' }
                });
            }

            res.setHeader('X-Resource-Type', 'PlayerStats');
            res.setHeader('Last-Modified', new Date().toUTCString());

            res.status(200).json({
                data: stats,
                _links: {
                    self: `/api/v1/player-stats/${stats._id}`,
                    collection: '/api/v1/player-stats'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/player-stats' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/player-stats' }
            });
        }
    });

/**
 * @swagger
 * /player-stats/{id}:
 *   delete:
 *     summary: Delete player stats
 *     tags: [PlayerStats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PlayerStats ID
 *     responses:
 *       204:
 *         description: Player stats deleted
 *       404:
 *         description: Player stats not found
 *       500:
 *         description: Server error
 */
playerStatsRouter.delete('/:statsId',
    validateObjectId('statsId'),
    async (req, res) => {
        try {
            const stats = await PlayerStats.findByIdAndDelete(req.params.statsId);

            if (!stats) {
                return res.status(404).json({
                    error: 'Player stats not found',
                    _links: { collection: '/api/v1/player-stats' }
                });
            }

            res.setHeader('X-Resource-Type', 'PlayerStats');
            res.setHeader('X-Deleted-At', new Date().toUTCString());

            res.status(204).end();
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/player-stats' }
            });
        }
    });