/**
 * @swagger
 * components:
 *   schemas:
 *     Manager:
 *       type: object
 *       required:
 *         - name
 *         - nationality
 *         - dateOfBirth
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Manager's full name
 *         nationality:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Manager's nationality
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: Manager's date of birth (must be between 18-100 years old)
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 *           default: ACTIVE
 *           description: Manager's current status
 *
 *   responses:
 *     ManagerResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/Manager'
 *         _links:
 *           type: object
 *           properties:
 *             self:
 *               type: string
 *             collection:
 *               type: string
 */

import express from 'express';
import { Manager } from '../models/Manager.js';
import { validateObjectId, validateAllowedFields } from '../middleware/validators.js';

export const managersRouter = express.Router();

const ALLOWED_FIELDS = [
    'name',
    'nationality',
    'dateOfBirth',
    'status'
];

/**
 * @swagger
 * /managers:
 *   get:
 *     summary: Get all managers
 *     tags: [Managers]
 *     responses:
 *       200:
 *         description: List of managers
 *         headers:
 *           X-Total-Count:
 *             description: Total number of managers
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
 *                     $ref: '#/components/schemas/Manager'
 *       404:
 *         description: No managers found
 *       500:
 *         description: Server error
 */
managersRouter.get('/', async (req, res) => {
    try {
        const managers = await Manager.find();

        res.setHeader('X-Total-Count', managers.length);
        res.setHeader('X-Resource-Type', 'Manager');

        if (managers.length === 0) {
            return res.status(404).end();
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

/**
 * @swagger
 * /managers/{id}:
 *   get:
 *     summary: Get manager by ID
 *     tags: [Managers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Manager ID
 *     responses:
 *       200:
 *         description: Manager found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ManagerResponse'
 *       404:
 *         description: Manager not found
 *       500:
 *         description: Server error
 */
managersRouter.get('/:managerId', validateObjectId('managerId'), async (req, res) => {
    try {
        const manager = await Manager.findById(req.params.managerId);

        if (!manager) {
            return res.status(404).json({
                error: 'Manager not found',
                _links: { collection: '/api/v1/managers' }
            });
        }

        res.setHeader('X-Resource-Type', 'Manager');
        res.setHeader('Last-Modified', manager.updatedAt.toUTCString());

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

/**
 * @swagger
 * /managers:
 *   post:
 *     summary: Create new manager
 *     tags: [Managers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Manager'
 *     responses:
 *       201:
 *         description: Manager created
 *         headers:
 *           Location:
 *             description: URL of created manager
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ManagerResponse'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
managersRouter.post('/',
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const newManager = new Manager(req.body);
            await newManager.save();

            res.setHeader('Location', `/api/v1/managers/${newManager._id}`);
            res.setHeader('X-Resource-Type', 'Manager');

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

/**
 * @swagger
 * /managers/{id}:
 *   put:
 *     summary: Update manager
 *     tags: [Managers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Manager ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Manager'
 *     responses:
 *       200:
 *         description: Manager updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ManagerResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Manager not found
 *       500:
 *         description: Server error
 */
managersRouter.put('/:managerId',
    validateObjectId('managerId'),
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const manager = await Manager.findById(req.params.managerId);

            if (!manager) {
                return res.status(404).json({
                    error: 'Manager not found',
                    _links: { collection: '/api/v1/managers' }
                });
            }

            Object.keys(manager.toObject()).forEach(key => {
                if (key !== '_id' && key !== '__v') {
                    manager[key] = undefined;
                }
            });

            Object.assign(manager, req.body);
            await manager.save();

            res.setHeader('X-Resource-Type', 'Manager');
            res.setHeader('Last-Modified', new Date().toUTCString());

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

/**
 * @swagger
 * /managers/{id}:
 *   patch:
 *     summary: Partially update manager
 *     tags: [Managers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Manager ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               nationality:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *     responses:
 *       200:
 *         description: Manager updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ManagerResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Manager not found
 *       500:
 *         description: Server error
 */
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

            res.setHeader('X-Resource-Type', 'Manager');
            res.setHeader('Last-Modified', new Date().toUTCString());

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

/**
 * @swagger
 * /managers/{id}:
 *   delete:
 *     summary: Delete manager
 *     tags: [Managers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Manager ID
 *     responses:
 *       204:
 *         description: Manager deleted
 *       404:
 *         description: Manager not found
 *       500:
 *         description: Server error
 */
managersRouter.delete('/:managerId', validateObjectId('managerId'), async (req, res) => {
    try {
        const manager = await Manager.findByIdAndDelete(req.params.managerId);

        if (!manager) {
            return res.status(404).json({
                error: 'Manager not found',
                _links: { collection: '/api/v1/managers' }
            });
        }

        res.setHeader('X-Resource-Type', 'Manager');
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