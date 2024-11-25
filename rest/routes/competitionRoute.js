import express from 'express';
import { Competition } from '../models/Competition.js';
import { validateObjectId } from '../middleware/validators.js';

export const competitionRouter = express.Router();

competitionRouter.get('/', async (req, res) => {
    try {
        const competitions = await Competition.find();
        res.status(200).json({ data: competitions, links: { self: '/api/v1/competitions' } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

competitionRouter.get('/:competitionId', validateObjectId('competitionId'), async (req, res) => {
    try {
        const competition = await Competition.findById(req.params.competitionId);
        if (!competition) return res.status(404).json({ message: 'Competition not found' });

        res.status(200).json({ data: competition });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

competitionRouter.post('/', async (req, res) => {
    try {
        const newCompetition = new Competition(req.body);
        await newCompetition.save();
        res.status(201).json({ data: newCompetition });
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});

competitionRouter.put('/:competitionId', validateObjectId('competitionId'), async (req, res) => {
    try {
        const competition = await Competition.findByIdAndUpdate(req.params.competitionId, req.body, {
            new: true,
            runValidators: true,
        });
        if (!competition) return res.status(404).json({ message: 'Competition not found' });

        res.status(200).json({ data: competition });
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});

competitionRouter.patch('/:competitionId', validateObjectId('competitionId'), async (req, res) => {
    try {
        const competition = await Competition.findByIdAndUpdate(req.params.competitionId, req.body, {
            new: true,
            runValidators: true,
        });
        if (!competition) return res.status(404).json({ message: 'Competition not found' });

        res.status(200).json({ data: competition });
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});

competitionRouter.delete('/:competitionId', validateObjectId('competitionId'), async (req, res) => {
    try {
        const competition = await Competition.findByIdAndDelete(req.params.competitionId);
        if (!competition) return res.status(404).json({ message: 'Competition not found' });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
