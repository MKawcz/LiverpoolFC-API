/**
 * @swagger
 * components:
 *   schemas:
 *     Season:
 *       type: object
 *       required:
 *         - years
 *         - manager
 *         - status
 *       properties:
 *         years:
 *           type: string
 *           pattern: ^\d{4}-\d{4}$
 *           description: Season years in format YYYY-YYYY (must be consecutive years)
 *           example: "2023-2024"
 *         trophies:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *           description: Array of references to Trophy model
 *         manager:
 *           type: string
 *           format: objectId
 *           description: Reference to Manager model
 *         status:
 *           type: string
 *           enum: [UPCOMING, IN_PROGRESS, FINISHED]
 *           default: UPCOMING
 *           description: Current status of the season
 *
 *   responses:
 *     SeasonResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/Season'
 *         _links:
 *           type: object
 *           properties:
 *             self:
 *               type: string
 *             collection:
 *               type: string
 *             manager:
 *               type: string
 *             trophies:
 *               type: array
 *               items:
 *                 type: string
 */


import express from 'express';
import { Season } from '../models/Season.js';
import { validateObjectId, validateAllowedFields, validateReferences } from '../middleware/validators.js';

export const seasonRouter = express.Router();

const ALLOWED_FIELDS = [
    'years', 'status',
    'trophies', 'manager',
];

/**
 * @swagger
 * /seasons:
 *   get:
 *     summary: Get all seasons
 *     tags: [Seasons]
 *     responses:
 *       200:
 *         description: List of seasons
 *         headers:
 *           X-Total-Count:
 *             description: Total number of seasons
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
 *                     $ref: '#/components/schemas/Season'
 *       404:
 *         description: No seasons found
 *       500:
 *         description: Server error
 */
seasonRouter.get('/', async (req, res) => {
    try {
        const seasons = await Season.find()
            .populate('manager', 'name')
            .populate('trophies');

        res.setHeader('X-Total-Count', seasons.length);
        res.setHeader('X-Resource-Type', 'Season');
        res.setHeader('Last-Modified', new Date().toUTCString());

        if (seasons.length === 0) {
            return res.status(404).end();
        }

        res.status(200).json({
            data: seasons.map(season => ({
                ...season.toObject(),
                _links: {
                    self: `/api/v1/seasons/${season._id}`,
                    collection: '/api/v1/seasons',
                    manager: season.manager ? `/api/v1/managers/${season.manager._id}` : null,
                    trophies: season.trophies?.map(trophy => `/api/v1/trophies/${trophy._id}`) ?? []
                }
            })),
            _links: {
                self: '/api/v1/seasons'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { self: '/api/v1/seasons' }
        });
    }
});

/**
 * @swagger
 * /seasons/{id}:
 *   get:
 *     summary: Get season by ID
 *     tags: [Seasons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Season ID
 *     responses:
 *       200:
 *         description: Season found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/SeasonResponse'
 *       404:
 *         description: Season not found
 *       500:
 *         description: Server error
 */
seasonRouter.get('/:seasonId',
    validateObjectId('seasonId'),
    async (req, res) => {
        try {
            const season = await Season.findById(req.params.seasonId)
                .populate('manager', 'name')
                .populate('trophies');

            if (!season) {
                return res.status(404).json({
                    error: 'Season not found',
                    _links: { collection: '/api/v1/seasons' }
                });
            }

            res.setHeader('X-Resource-Type', 'Season');
            res.setHeader('Last-Modified', season.updatedAt.toUTCString());

            res.status(200).json({
                data: season,
                _links: {
                    self: `/api/v1/seasons/${season._id}`,
                    collection: '/api/v1/seasons',
                    manager: season.manager ? `/api/v1/managers/${season.manager._id}` : null,
                    trophies: season.trophies?.map(trophy => `/api/v1/trophies/${trophy._id}`) ?? []
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/seasons' }
            });
        }
});

/**
 * @swagger
 * /seasons:
 *   post:
 *     summary: Create new season
 *     tags: [Seasons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Season'
 *     responses:
 *       201:
 *         description: Season created
 *         headers:
 *           Location:
 *             description: URL of created season
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/SeasonResponse'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Season with these years already exists
 *       500:
 *         description: Server error
 */
seasonRouter.post('/',
    validateAllowedFields(ALLOWED_FIELDS),
    validateReferences({
        'trophies': 'Trophy',
        'manager': 'Manager'
    }),
    async (req, res) => {
        try {
            const newSeason = new Season(req.body);
            await newSeason.save();

            res.setHeader('Location', `/api/v1/seasons/${newSeason._id}`);
            res.setHeader('X-Resource-Type', 'Season');

            res.status(201).json({
                data: newSeason,
                _links: {
                    self: `/api/v1/seasons/${newSeason._id}`,
                    collection: '/api/v1/seasons',
                    manager: newSeason.manager ? `/api/v1/managers/${newSeason.manager}` : null,
                    trophies: newSeason.trophies?.map(trophy => `/api/v1/trophies/${trophy._id}`) ?? []
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/seasons' }
                });
            }
            if (error.code === 11000) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Season with these years already exists',
                    _links: { collection: '/api/v1/seasons' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/seasons' }
            });
        }
});

/**
 * @swagger
 * /seasons/{id}:
 *   put:
 *     summary: Update season
 *     tags: [Seasons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Season ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Season'
 *     responses:
 *       200:
 *         description: Season updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/SeasonResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Season not found
 *       409:
 *         description: Season with these years already exists
 *       500:
 *         description: Server error
 */
seasonRouter.put('/:seasonId',
    validateObjectId('seasonId'),
    validateAllowedFields(ALLOWED_FIELDS),
    validateReferences({
        'trophies': 'Trophy',
        'manager': 'Manager'
    }),
    async (req, res) => {
        try {
            const season = await Season.findById(req.params.seasonId);

            if (!season) {
                return res.status(404).json({
                    error: 'Season not found',
                    _links: { collection: '/api/v1/seasons' }
                });
            }

            Object.keys(season.toObject()).forEach(key => {
                if (key !== '_id' && key !== '__v') {
                    season[key] = undefined;
                }
            });

            Object.assign(season, req.body);
            await season.save();
            await season.populate(['manager', 'trophies']);

            res.setHeader('X-Resource-Type', 'Season');
            res.setHeader('Last-Modified', new Date().toUTCString());

            res.status(200).json({
                data: season,
                _links: {
                    self: `/api/v1/seasons/${season._id}`,
                    collection: '/api/v1/seasons',
                    manager: season.manager ? `/api/v1/managers/${season.manager._id}` : null,
                    trophies: season.trophies?.map(trophy => `/api/v1/trophies/${trophy._id}`) ?? []
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/seasons' }
                });
            }
            if (error.code === 11000) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Season with these years already exists',
                    _links: { collection: '/api/v1/seasons' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/seasons' }
            });
        }
});

/**
 * @swagger
 * /seasons/{id}:
 *   patch:
 *     summary: Partially update season
 *     tags: [Seasons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Season ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               years:
 *                 type: string
 *                 pattern: ^\d{4}-\d{4}$
 *               trophies:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: objectId
 *               manager:
 *                 type: string
 *                 format: objectId
 *               status:
 *                 type: string
 *                 enum: [UPCOMING, IN_PROGRESS, FINISHED]
 *     responses:
 *       200:
 *         description: Season updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/SeasonResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Season not found
 *       409:
 *         description: Season with these years already exists
 *       500:
 *         description: Server error
 */
seasonRouter.patch('/:seasonId',
    validateObjectId('seasonId'),
    validateAllowedFields(ALLOWED_FIELDS),
    validateReferences({
        'trophies': 'Trophy',
        'manager': 'Manager'
    }),
    async (req, res) => {
        try {
            const season = await Season.findByIdAndUpdate(
                req.params.seasonId,
                { $set: req.body },
                { new: true, runValidators: true }
            )
                .populate('manager', 'name')
                .populate('trophies');

            if (!season) {
                return res.status(404).json({
                    error: 'Season not found',
                    _links: { collection: '/api/v1/seasons' }
                });
            }

            res.setHeader('X-Resource-Type', 'Season');
            res.setHeader('Last-Modified', new Date().toUTCString());

            res.status(200).json({
                data: season,
                _links: {
                    self: `/api/v1/seasons/${season._id}`,
                    collection: '/api/v1/seasons',
                    manager: season.manager ? `/api/v1/managers/${season.manager._id}` : null,
                    trophies: season.trophies?.map(trophy => `/api/v1/trophies/${trophy._id}`) ?? []
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/seasons' }
                });
            }
            if (error.code === 11000) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Season with these years already exists',
                    _links: { collection: '/api/v1/seasons' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/seasons' }
            });
        }
});

/**
 * @swagger
 * /seasons/{id}:
 *   delete:
 *     summary: Delete season
 *     tags: [Seasons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Season ID
 *     responses:
 *       204:
 *         description: Season deleted
 *       404:
 *         description: Season not found
 *       500:
 *         description: Server error
 */
seasonRouter.delete('/:seasonId',
    validateObjectId('seasonId'),
    async (req, res) => {
        try {
            const season = await Season.findByIdAndDelete(req.params.seasonId);

            if (!season) {
                return res.status(404).json({
                    error: 'Season not found',
                    _links: { collection: '/api/v1/seasons' }
                });
            }

            res.setHeader('X-Resource-Type', 'Season');
            res.setHeader('X-Deleted-At', new Date().toUTCString());

            res.status(204).end();
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/seasons' }
            });
        }
});