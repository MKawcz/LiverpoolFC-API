import express from 'express';
import { Stadium } from '../models/Stadium.js';
import {validateObjectId} from "../middleware/validators.js";

export const stadiumsRouter = express.Router();

stadiumsRouter.get('/', async (req, res) => {
    try {
        const stadiums = await Stadium.find();
        res.status(200).json({
            data: stadiums,
            links: { self: '/api/v1/stadiums' },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

stadiumsRouter.get('/:stadiumId',
    validateObjectId('stadiumId'),
    async (req, res) => {
    try {
        const stadium = await Stadium.findById(req.params.stadiumId);
        if (!stadium) {
            return res.status(404).json({ message: 'Stadium not found' });
        }
        res.status(200).json({
            data: stadium,
            links: {
                self: `/api/v1/stadiums/${req.params.stadiumId}`,
                matches: `/api/v1/matches?stadiumId=${req.params.stadiumId}`,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

stadiumsRouter.post(
    '/',
    validatePostPut(['name', 'capacity', 'location']),
    async (req, res) => {
        try {
            const newStadium = new Stadium(req.body);
            await newStadium.save();
            res.status(201).json(newStadium);
        } catch (error) {
            res.status(400).json({ message: 'Invalid data', error });
        }
    }
);

stadiumsRouter.put(
    '/:stadiumId',
    validateObjectId('stadiumId'),
    async (req, res) => {
        try {
            const stadium = await Stadium.findByIdAndUpdate(req.params.stadiumId, req.body, { new: true });
            if (!stadium) {
                return res.status(404).json({ message: 'Stadium not found' });
            }
            res.status(200).json(stadium);
        } catch (error) {
            res.status(400).json({ message: 'Invalid data', error });
        }
    }
);

stadiumsRouter.patch(
    '/:stadiumId',
    validateObjectId('stadiumId'),
    async (req, res) => {
        try {
            const stadium = await Stadium.findByIdAndUpdate(req.params.stadiumId, req.body, { new: true });
            if (!stadium) {
                return res.status(404).json({ message: 'Stadium not found' });
            }
            res.status(200).json(stadium);
        } catch (error) {
            res.status(400).json({ message: 'Invalid data', error });
        }
    }
);

stadiumsRouter.delete('/:stadiumId',
    validateObjectId('stadiumId'),
    async (req, res) => {
    try {
        const stadium = await Stadium.findByIdAndDelete(req.params.stadiumId);
        if (!stadium) {
            return res.status(404).json({ message: 'Stadium not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
