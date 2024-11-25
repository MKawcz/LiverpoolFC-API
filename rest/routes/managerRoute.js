import express from 'express';
import { Manager } from '../models/Manager.js';
import { validateObjectId } from '../middleware/validators.js';

export const managersRouter = express.Router();

managersRouter.get('/', async (req, res) => {
    try {
        const managers = await Manager.find().select('name nationality dateOfBirth');
        res.status(200).json({
            data: managers,
            links: {
                self: '/api/v1/managers',
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

managersRouter.get('/:managerId', validateObjectId('managerId'), async (req, res) => {
    try {
        const manager = await Manager.findById(req.params.managerId).select('name nationality dateOfBirth');
        if (!manager) return res.status(404).json({ message: 'Manager not found' });

        res.status(200).json({
            data: manager,
            links: {
                self: `/api/v1/managers/${req.params.managerId}`,
                allManagers: '/api/v1/managers',
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

managersRouter.post(
    '/',
    async (req, res) => {
        try {
            const newManager = new Manager(req.body);
            await newManager.save();

            res.status(201).json({
                data: newManager,
                links: {
                    self: `/api/v1/managers/${newManager._id}`,
                    allManagers: '/api/v1/managers',
                },
            });
        } catch (error) {
            res.status(400).json({ message: 'Invalid data', error });
        }
    }
);

managersRouter.put(
    '/:managerId',
    validateObjectId('managerId'),
    async (req, res) => {
        try {
            const manager = await Manager.findByIdAndUpdate(req.params.managerId, req.body, {
                new: true,
                runValidators: true,
            });

            if (!manager) return res.status(404).json({ message: 'Manager not found' });

            res.status(200).json({
                data: manager,
                links: {
                    self: `/api/v1/managers/${manager._id}`,
                    allManagers: '/api/v1/managers',
                },
            });
        } catch (error) {
            res.status(400).json({ message: 'Invalid data', error });
        }
    }
);

managersRouter.patch(
    '/:managerId',
    validateObjectId('managerId'),
    async (req, res) => {
        try {
            const manager = await Manager.findByIdAndUpdate(req.params.managerId, req.body, {
                new: true,
                runValidators: true,
            });

            if (!manager) return res.status(404).json({ message: 'Manager not found' });

            res.status(200).json({
                data: manager,
                links: {
                    self: `/api/v1/managers/${manager._id}`,
                    allManagers: '/api/v1/managers',
                },
            });
        } catch (error) {
            res.status(400).json({ message: 'Invalid data', error });
        }
    }
);

managersRouter.delete('/:managerId',
    validateObjectId('managerId'),
    async (req, res) => {
    try {
        const manager = await Manager.findByIdAndDelete(req.params.managerId);
        if (!manager) return res.status(404).json({ message: 'Manager not found' });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
