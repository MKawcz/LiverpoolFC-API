/**
 * @swagger
 * components:
 *   schemas:
 *     PlayerName:
 *       type: object
 *       required:
 *         - first
 *         - last
 *       properties:
 *         first:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Player's first name
 *         last:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Player's last name
 *         displayName:
 *           type: string
 *           maxLength: 100
 *           description: Player's display name (optional)
 *
 *     MarketValue:
 *       type: object
 *       required:
 *         - value
 *         - currency
 *       properties:
 *         value:
 *           type: number
 *           minimum: 0
 *           description: Player's market value
 *         currency:
 *           type: string
 *           enum: [EUR, GBP, USD]
 *           description: Currency of the market value
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date when market value was set
 *
 *     Player:
 *       type: object
 *       required:
 *         - name
 *         - position
 *         - nationality
 *         - dateOfBirth
 *         - marketValue
 *       properties:
 *         name:
 *           $ref: '#/components/schemas/PlayerName'
 *         position:
 *           type: string
 *           enum: [GK, DEF, MID, FWD]
 *           description: Player's position
 *         nationality:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Player's nationality
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: Player's birth date (must be between 15-45 years old)
 *         height:
 *           type: number
 *           minimum: 150
 *           maximum: 220
 *           description: Player's height in cm
 *         weight:
 *           type: number
 *           minimum: 50
 *           maximum: 120
 *           description: Player's weight in kg
 *         status:
 *           type: string
 *           enum: [ACTIVE, INJURED, SUSPENDED, ON_LOAN, INACTIVE]
 *           default: ACTIVE
 *           description: Player's current status
 *         jerseyNumber:
 *           type: number
 *           minimum: 1
 *           maximum: 99
 *           description: Player's jersey number (must be unique)
 *         marketValue:
 *           $ref: '#/components/schemas/MarketValue'
 *         currentContract:
 *           type: string
 *           format: objectId
 *           description: Reference to current Contract model
 *         stats:
 *           type: string
 *           format: objectId
 *           description: Reference to PlayerStats model
 *
 *   responses:
 *     PlayerResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/Player'
 *         _links:
 *           type: object
 *           properties:
 *             self:
 *               type: string
 *             collection:
 *               type: string
 */

import express from 'express';
import { Player } from '../models/Player.js';
import {validateObjectId, validateAllowedFields, validateReferences} from '../middleware/validators.js';

export const playersRouter = express.Router();

// Definiujemy dozwolone pola na podstawie schematu, uwzględniając strukturę zagnieżdżoną
const ALLOWED_FIELDS = [
    'name', 'name.first', 'name.last', 'name.displayName',
    'currentContract', 'stats', 'marketValue',
    'position', 'nationality', 'dateOfBirth',
    'height', 'weight', 'status', 'jerseyNumber',
    'marketValue.value', 'marketValue.currency',
];

/**
 * @swagger
 * /players:
 *   get:
 *     summary: Get all players
 *     tags: [Players]
 *     responses:
 *       200:
 *         description: List of players
 *         headers:
 *           X-Total-Count:
 *             description: Total number of players
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
 *                     $ref: '#/components/schemas/Player'
 *       204:
 *         description: No players found
 *       500:
 *         description: Server error
 */
playersRouter.get('/', async (req, res) => {
    try {
        const players = await Player.find()
            .populate('stats', 'goals assists')
            .populate('currentContract', 'start end salary');

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
                    stats: player.stats ? `/api/v1/player-stats/${player.stats._id}` : null,
                    currentContract: player.currentContract ? `/api/v1/contracts/${player.currentContract._id}` : null,
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

/**
 * @swagger
 * /players/{id}:
 *   get:
 *     summary: Get player by ID
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Player ID
 *     responses:
 *       200:
 *         description: Player found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/PlayerResponse'
 *       404:
 *         description: Player not found
 *       500:
 *         description: Server error
 */
playersRouter.get('/:playerId',
    validateObjectId('playerId'),
    async (req, res) => {
        try {
            const player = await Player.findById(req.params.playerId)
                .populate('stats')
                .populate('currentContract');

            if (!player) {
                return res.status(404).json({
                    error: 'Player not found',
                    _links: { collection: '/api/v1/players' }
                });
            }

            res.setHeader('X-Resource-Type', 'Player');
            res.setHeader('Last-Modified', player.updatedAt.toUTCString());

            res.status(200).json({
                data: player,
                _links: {
                    self: `/api/v1/players/${player._id}`,
                    stats: player.stats ? `/api/v1/player-stats/${player.stats._id}` : null,
                    currentContract: player.currentContract ? `/api/v1/contracts/${player.currentContract._id}` : null,
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

/**
 * @swagger
 * /players:
 *   post:
 *     summary: Create new player
 *     tags: [Players]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Player'
 *     responses:
 *       201:
 *         description: Player created
 *         headers:
 *           Location:
 *             description: URL of created player
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/PlayerResponse'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Jersey number already taken
 *       500:
 *         description: Server error
 */
playersRouter.post('/',
    validateAllowedFields(ALLOWED_FIELDS),
    validateReferences({
        'currentContract': 'Contract',
        'stats': 'PlayerStats'
    }),
    async (req, res) => {
        try {
            const newPlayer = new Player(req.body);
            await newPlayer.save();

            res.setHeader('Location', `/api/v1/players/${newPlayer._id}`);
            res.setHeader('X-Resource-Type', 'Player');

            res.status(201).json({
                data: newPlayer,
                _links: {
                    self: `/api/v1/players/${newPlayer._id}`,
                    stats: newPlayer.stats ? `/api/v1/player-stats/${newPlayer.stats._id}` : null,
                    currentContract: newPlayer.currentContract ? `/api/v1/contracts/${newPlayer.currentContract._id}` : null,
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

/**
 * @swagger
 * /players/{id}:
 *   put:
 *     summary: Update player
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Player ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Player'
 *     responses:
 *       200:
 *         description: Player updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/PlayerResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Player not found
 *       409:
 *         description: Jersey number already taken
 *       500:
 *         description: Server error
 */
playersRouter.put('/:playerId',
    validateObjectId('playerId'),
    validateAllowedFields(ALLOWED_FIELDS),
    validateReferences({
        'currentContract': 'Contract',
        'stats': 'PlayerStats'
    }),
    async (req, res) => {
        try {
            const player = await Player.findById(req.params.playerId);

            if (!player) {
                return res.status(404).json({
                    error: 'Player not found',
                    _links: { collection: '/api/v1/players' }
                });
            }

            Object.keys(player.toObject()).forEach(key => {
                if (key !== '_id' && key !== '__v') {
                    player[key] = undefined;
                }
            });

            Object.assign(player, req.body);
            await player.save();
            await player.populate(['stats', 'currentContract']);

            res.setHeader('X-Resource-Type', 'Player');
            res.setHeader('Last-Modified', new Date().toUTCString());

            res.status(200).json({
                data: player,
                _links: {
                    self: `/api/v1/players/${player._id}`,
                    stats: player.stats ? `/api/v1/player-stats/${player.stats._id}` : null,
                    currentContract: player.currentContract ? `/api/v1/contracts/${player.currentContract._id}` : null,
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

/**
 * @swagger
 * /players/{id}:
 *   patch:
 *     summary: Partially update player
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Player ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Player'
 *     responses:
 *       200:
 *         description: Player updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/PlayerResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Player not found
 *       409:
 *         description: Jersey number already taken
 *       500:
 *         description: Server error
 */
playersRouter.patch('/:playerId',
    validateObjectId('playerId'),
    validateAllowedFields(ALLOWED_FIELDS),
    validateReferences({
        'currentContract': 'Contract',
        'stats': 'PlayerStats'
    }),
    async (req, res) => {
        try {
            const player = await Player.findByIdAndUpdate(
                req.params.playerId,
                { $set: req.body },
                { new: true, runValidators: true }
            )
                .populate('stats')
                .populate('currentContract');

            if (!player) {
                return res.status(404).json({
                    error: 'Player not found',
                    _links: { collection: '/api/v1/players' }
                });
            }

            res.setHeader('X-Resource-Type', 'Player');
            res.setHeader('Last-Modified', new Date().toUTCString());

            res.status(200).json({
                data: player,
                _links: {
                    self: `/api/v1/players/${player._id}`,
                    stats: player.stats ? `/api/v1/player-stats/${player.stats._id}` : null,
                    currentContract: player.currentContract ? `/api/v1/contracts/${player.currentContract._id}` : null,
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

/**
 * @swagger
 * /players/{id}:
 *   delete:
 *     summary: Delete player
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Player ID
 *     responses:
 *       204:
 *         description: Player deleted
 *       404:
 *         description: Player not found
 *       500:
 *         description: Server error
 */
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