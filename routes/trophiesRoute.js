import express from 'express';
import { Trophy } from '../models/Trophy.js';
import { validatePostPut, validatePatch } from '../validation.js';

export const trophiesRouter = express.Router();

trophiesRouter.get('/', async (req, res) => {
    try {
        const trophies = await Trophy.find().select('name finalsWon');
        res.status(200).json({
            data: trophies,
            links: { self: '/api/v1/trophies' },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

trophiesRouter.get('/:trophyId', async (req, res) => {
    try {
        const trophy = await Trophy.findById(req.params.trophyId).select('name finalsWon');
        if (trophy) {
            res.status(200).json({
                data: trophy,
                links: {
                    self: `/api/v1/trophies/${req.params.trophyId}`,
                    seasons: `/api/v1/trophies/${req.params.trophyId}/seasons`,
                }
            });
        } else {
            res.status(404).json({ message: 'Trophy not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

trophiesRouter.post(
    '/', 
    validatePostPut(['name', 'finalsWon']),
    async (req, res) => {
        try {
            const newTrophy = new Trophy(req.body);
            await newTrophy.save();
            res.status(201).json(newTrophy);
        } catch (error) {
            res.status(400).json({ message: 'Invalid data', error });
        }
});

trophiesRouter.put(
    '/:trophyId', 
    validatePostPut(['name', 'finalsWon']),
    async (req, res) => {
        try {
            const trophy = await Trophy.findByIdAndUpdate(req.params.trophyId, req.body, { new: true });
            if (trophy) {
                res.status(200).json(trophy);
            } else {
                res.status(404).json({ message: 'Trophy not found' });
            }
        } catch (error) {
            res.status(400).json({ message: 'Invalid data', error });
        }
});

trophiesRouter.patch(
    '/:trophyId',
    validatePatch(['name', 'finalsWon']),
    async (req, res) => {
        try {
            const trophy = await Trophy.findByIdAndUpdate(req.params.trophyId, req.body, { new: true });
            if (trophy) {
                res.status(200).json(trophy);
            } else {
                res.status(404).json({ message: 'Trophy not found' });
            }
        } catch (error) {
            res.status(400).json({ message: 'Invalid data', error });
        }
    }
);

trophiesRouter.delete('/:trophyId', async (req, res) => {
    try {
        const trophy = await Trophy.findByIdAndDelete(req.params.trophyId);
        if (trophy) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Trophy not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


trophiesRouter.get('/:trophyId/seasons', async (req, res) => {
    try {
        const trophy = await Trophy.findById(req.params.trophyId).select('seasons');
        if (!trophy) {
            return res.status(404).json({ message: 'Trophy not found' });
        }
        res.status(200).json({
            data: trophy.seasons,
            links: {
                self: `/api/v1/trophies/${req.params.trophyId}/seasons`,
                trophy: `/api/v1/trophies/${req.params.trophyId}`
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

trophiesRouter.post('/:trophyId/seasons', async (req, res) => {
    try {
        const trophy = await Trophy.findById(req.params.trophyId);
        if (!trophy) {
            return res.status(404).json({ message: 'Trophy not found' });
        }
        trophy.seasons.push(req.body);
        await trophy.save();
        res.status(201).json(trophy.seasons);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});

trophiesRouter.put('/:trophyId/seasons', async (req, res) => {
    try {
        const trophy = await Trophy.findById(req.params.trophyId);
        if (!trophy) {
            return res.status(404).json({ message: 'Trophy not found' });
        }
        trophy.seasons = req.body;
        await trophy.save();
        res.status(200).json(trophy.seasons);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});
