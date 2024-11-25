import express from 'express';
import { Contract } from '../models/Contract.js';
import { validateObjectId } from '../middleware/validators.js';

export const contractRouter = express.Router();

contractRouter.get('/', async (req, res) => {
    try {
        const contracts = await Contract.find();
        res.status(200).json({ data: contracts, links: { self: '/api/v1/contracts' } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

contractRouter.get('/:contractId',
    validateObjectId('contractId'),
    async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.contractId);
        if (!contract) return res.status(404).json({ message: 'Contract not found' });

        res.status(200).json({ data: contract });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

contractRouter.post('/', async (req, res) => {
    try {
        const newContract = new Contract(req.body);
        await newContract.save();
        res.status(201).json({ data: newContract });
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});

contractRouter.put('/:contractId', validateObjectId('contractId'), async (req, res) => {
    try {
        const contract = await Contract.findByIdAndUpdate(req.params.contractId, req.body, {
            new: true,
            runValidators: true,
        });
        if (!contract) return res.status(404).json({ message: 'Contract not found' });

        res.status(200).json({ data: contract });
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});

contractRouter.patch('/:contractId', validateObjectId('contractId'), async (req, res) => {
    try {
        const contract = await Contract.findByIdAndUpdate(req.params.contractId, req.body, {
            new: true,
            runValidators: true,
        });
        if (!contract) return res.status(404).json({ message: 'Contract not found' });

        res.status(200).json({ data: contract });
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error });
    }
});

contractRouter.delete('/:contractId', validateObjectId('contractId'), async (req, res) => {
    try {
        const contract = await Contract.findByIdAndDelete(req.params.contractId);
        if (!contract) return res.status(404).json({ message: 'Contract not found' });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
