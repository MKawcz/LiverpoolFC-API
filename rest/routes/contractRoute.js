/**
 * @swagger
 * components:
 *   schemas:
 *     Bonus:
 *       type: object
 *       required:
 *         - type
 *         - amount
 *       properties:
 *         type:
 *           type: string
 *           enum: [GOAL, ASSIST, CLEAN_SHEET, APPEARANCE, WIN]
 *           description: Type of bonus
 *         amount:
 *           type: number
 *           minimum: 0
 *           description: Bonus amount
 *
 *     Contract:
 *       type: object
 *       required:
 *         - start
 *         - end
 *         - salary
 *       properties:
 *         start:
 *           type: string
 *           format: date
 *           description: Contract start date (cannot be in future)
 *         end:
 *           type: string
 *           format: date
 *           description: Contract end date (must be after start date)
 *         salary:
 *           type: object
 *           required:
 *             - base
 *             - currency
 *           properties:
 *             base:
 *               type: number
 *               minimum: 0
 *               description: Base salary amount
 *             currency:
 *               type: string
 *               enum: [GBP, EUR, USD]
 *               default: GBP
 *               description: Salary currency
 *         bonuses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Bonus'
 *           description: List of contract bonuses
 *
 *     ContractRequest:
 *       type: object
 *       required:
 *         - start
 *         - end
 *         - salary
 *       properties:
 *         start:
 *           type: string
 *           format: date
 *           description: Contract start date (cannot be in future)
 *         end:
 *           type: string
 *           format: date
 *           description: Contract end date (must be after start date)
 *         salary:
 *           type: object
 *           required:
 *             - base
 *             - currency
 *           properties:
 *             base:
 *               type: number
 *               minimum: 0
 *               description: Base salary amount
 *             currency:
 *               type: string
 *               enum: [GBP, EUR, USD]
 *               default: GBP
 *               description: Salary currency
 *   responses:
 *     ContractResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/Contract'
 *         _links:
 *           type: object
 *           properties:
 *             self:
 *               type: string
 *             collection:
 *               type: string
 */

import express from 'express';
import { Contract } from '../models/Contract.js';
import { validateObjectId, validateAllowedFields } from '../middleware/validators.js';

export const contractRouter = express.Router();

const ALLOWED_FIELDS = [
    'start', 'end', 'salary',
    'salary.base', 'salary.currency'
];

const ALLOWED_BONUS_FIELDS = ['type', 'amount'];

/**
 * @swagger
 * /contracts:
 *   get:
 *     summary: Get all contracts
 *     tags: [Contracts]
 *     responses:
 *       200:
 *         description: List of contracts
 *         headers:
 *           X-Total-Count:
 *             description: Total number of contracts
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
 *                     $ref: '#/components/schemas/Contract'
 *       204:
 *         description: No contracts found
 *       500:
 *         description: Server error
 */
contractRouter.get('/', async (req, res) => {
    try {
        const contracts = await Contract.find();

        // Custom headers
        res.setHeader('X-Total-Count', contracts.length);
        res.setHeader('X-Resource-Type', 'Contract');
        res.setHeader('Last-Modified', new Date().toUTCString());

        if (contracts.length === 0) {
            return res.status(204).end();
        }

        res.status(200).json({
            data: contracts.map(contract => ({
                ...contract.toObject(),
                _links: {
                    self: `/api/v1/contracts/${contract._id}`
                }
            })),
            _links: {
                self: '/api/v1/contracts'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { self: '/api/v1/contracts' }
        });
    }
});

/**
 * @swagger
 * /contracts/{id}:
 *   get:
 *     summary: Get contract by ID
 *     tags: [Contracts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *     responses:
 *       200:
 *         description: Contract found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ContractResponse'
 *       304:
 *         description: Not modified (ETag matched)
 *       404:
 *         description: Contract not found
 *       500:
 *         description: Server error
 */
contractRouter.get('/:contractId', validateObjectId('contractId'), async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.contractId);

        if (!contract) {
            return res.status(404).json({
                error: 'Contract not found',
                _links: { collection: '/api/v1/contracts' }
            });
        }

        const etag = `"contract-${contract._id}"`;
        if (req.headers['if-none-match'] === etag) {
            return res.status(304).end();
        }

        // Custom headers
        res.setHeader('X-Resource-Type', 'Contract');
        res.setHeader('Last-Modified', contract.updatedAt.toUTCString());
        res.setHeader('ETag', etag);

        res.status(200).json({
            data: contract,
            _links: {
                self: `/api/v1/contracts/${contract._id}`,
                collection: '/api/v1/contracts'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { collection: '/api/v1/contracts' }
        });
    }
});

/**
 * @swagger
 * /contracts:
 *   post:
 *     summary: Create new contract
 *     tags: [Contracts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContractRequest'
 *     responses:
 *       201:
 *         description: Contract created
 *         headers:
 *           Location:
 *             description: URL of created contract
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ContractResponse'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
contractRouter.post('/', validateAllowedFields(ALLOWED_FIELDS), async (req, res) => {
    try {
        const newContract = new Contract(req.body);
        await newContract.save();

        // Custom headers
        res.setHeader('Location', `/api/v1/contracts/${newContract._id}`);
        res.setHeader('X-Resource-Type', 'Contract');
        res.setHeader('X-Resource-Id', newContract._id.toString());

        res.status(201).json({
            data: newContract,
            _links: {
                self: `/api/v1/contracts/${newContract._id}`,
                collection: '/api/v1/contracts'
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation Error',
                message: error.message,
                _links: { collection: '/api/v1/contracts' }
            });
        }
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { collection: '/api/v1/contracts' }
        });
    }
});

/**
 * @swagger
 * /contracts/{id}:
 *   put:
 *     summary: Update contract
 *     tags: [Contracts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               $ref: '#/components/schemas/ContractRequest'
 *     responses:
 *       200:
 *         description: Contract updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ContractResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Contract not found
 *       500:
 *         description: Server error
 */
contractRouter.put('/:contractId',
    validateObjectId('contractId'),
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const contract = await Contract.findById(req.params.contractId);

            if (!contract) {
                return res.status(404).json({
                    error: 'Contract not found',
                    _links: { collection: '/api/v1/contracts' }
                });
            }

            Object.assign(contract, req.body);

            await contract.save();

            res.setHeader('X-Resource-Type', 'Contract');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', contract._id.toString());

            res.status(200).json({
                data: contract,
                _links: {
                    self: `/api/v1/contracts/${contract._id}`,
                    collection: '/api/v1/contracts'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/contracts' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/contracts' }
            });
        }
    });

/**
 * @swagger
 * /contracts/{id}:
 *   patch:
 *     summary: Partially update contract
 *     tags: [Contracts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContractRequest'
 *     responses:
 *       200:
 *         description: Contract updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ContractResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Contract not found
 *       500:
 *         description: Server error
 */
contractRouter.patch('/:contractId',
    validateObjectId('contractId'),
    validateAllowedFields(ALLOWED_FIELDS),
    async (req, res) => {
        try {
            const contract = await Contract.findById(req.params.contractId);

            if (!contract) {
                return res.status(404).json({
                    error: 'Contract not found',
                    _links: { collection: '/api/v1/contracts' }
                });
            }

            for (const [key, value] of Object.entries(req.body)) {
                if (key === 'salary') {
                    for (const [salaryKey, salaryValue] of Object.entries(value)) {
                        contract.salary[salaryKey] = salaryValue;
                    }
                } else {
                    contract[key] = value;
                }
            }

            await contract.save();

            res.setHeader('X-Resource-Type', 'Contract');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', contract._id.toString());

            res.status(200).json({
                data: contract,
                _links: {
                    self: `/api/v1/contracts/${contract._id}`,
                    collection: '/api/v1/contracts'
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/contracts' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/contracts' }
            });
        }
    });

/**
 * @swagger
 * /contracts/{id}:
 *   delete:
 *     summary: Delete contract
 *     tags: [Contracts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *     responses:
 *       204:
 *         description: Contract deleted
 *       404:
 *         description: Contract not found
 *       500:
 *         description: Server error
 */
contractRouter.delete('/:contractId', validateObjectId('contractId'), async (req, res) => {
    try {
        const contract = await Contract.findByIdAndDelete(req.params.contractId);

        if (!contract) {
            return res.status(404).json({
                error: 'Contract not found',
                _links: { collection: '/api/v1/contracts' }
            });
        }

        // Custom headers
        res.setHeader('X-Resource-Type', 'Contract');
        res.setHeader('X-Resource-Id', contract._id.toString());
        res.setHeader('X-Deleted-At', new Date().toUTCString());

        res.status(204).end();
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { collection: '/api/v1/contracts' }
        });
    }
});

/**
 * @swagger
 * /contracts/{id}/bonuses:
 *   get:
 *     summary: Get all bonuses for a contract
 *     tags: [Bonuses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *     responses:
 *       200:
 *         description: List of bonuses
 *         headers:
 *           X-Total-Count:
 *             description: Total number of bonuses
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
 *                     $ref: '#/components/schemas/Bonus'
 *       204:
 *         description: No bonuses found
 *       404:
 *         description: Contract not found
 *       500:
 *         description: Server error
 */
contractRouter.get('/:contractId/bonuses',
    validateObjectId('contractId'),
    async (req, res) => {
        try {
            const contract = await Contract.findById(req.params.contractId);

            if (!contract) {
                return res.status(404).json({
                    error: 'Contract not found',
                    _links: { collection: '/api/v1/contracts' }
                });
            }

            // Custom headers
            res.setHeader('X-Total-Count', contract.bonuses.length);
            res.setHeader('X-Resource-Type', 'Bonus');
            res.setHeader('Last-Modified', contract.updatedAt.toUTCString());

            if (contract.bonuses.length === 0) {
                return res.status(204).end();
            }

            res.status(200).json({
                data: contract.bonuses.map((bonus, index) => ({
                    ...bonus.toObject(),
                    _links: {
                        self: `/api/v1/contracts/${contract._id}/bonuses/${index}`,
                        contract: `/api/v1/contracts/${contract._id}`
                    }
                })),
                _links: {
                    self: `/api/v1/contracts/${contract._id}/bonuses`,
                    contract: `/api/v1/contracts/${contract._id}`
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/contracts' }
            });
        }
});

/**
 * @swagger
 * /contracts/{id}/bonuses/{bonusIndex}:
 *   get:
 *     summary: Get specific bonus from contract
 *     tags: [Bonuses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *       - in: path
 *         name: bonusIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bonus index in array
 *     responses:
 *       200:
 *         description: Bonus found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Bonus'
 *       404:
 *         description: Contract or bonus not found
 *       500:
 *         description: Server error
 */
contractRouter.get('/:contractId/bonuses/:bonusIndex',
    validateObjectId('contractId'),
    async (req, res) => {
        try {
            const contract = await Contract.findById(req.params.contractId);
            const bonusIndex = parseInt(req.params.bonusIndex);

            if (!contract) {
                return res.status(404).json({
                    error: 'Contract not found',
                    _links: { collection: '/api/v1/contracts' }
                });
            }

            if (bonusIndex >= contract.bonuses.length || bonusIndex < 0) {
                return res.status(404).json({
                    error: 'Bonus not found',
                    _links: {
                        collection: `/api/v1/contracts/${contract._id}/bonuses`,
                        contract: `/api/v1/contracts/${contract._id}`
                    }
                });
            }

            const bonus = contract.bonuses[bonusIndex];

            res.setHeader('X-Resource-Type', 'Bonus');
            res.setHeader('Last-Modified', contract.updatedAt.toUTCString());
            res.setHeader('ETag', `"bonus-${contract._id}-${bonusIndex}"`);

            res.status(200).json({
                data: bonus,
                _links: {
                    self: `/api/v1/contracts/${contract._id}/bonuses/${bonusIndex}`,
                    collection: `/api/v1/contracts/${contract._id}/bonuses`,
                    contract: `/api/v1/contracts/${contract._id}`
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/contracts' }
            });
        }
});

/**
 * @swagger
 * /contracts/{id}/bonuses:
 *   post:
 *     summary: Add bonus to contract
 *     tags: [Bonuses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Bonus'
 *     responses:
 *       201:
 *         description: Bonus created
 *         headers:
 *           Location:
 *             description: URL of created bonus
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Bonus'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Contract not found
 *       500:
 *         description: Server error
 */
contractRouter.post('/:contractId/bonuses',
    validateObjectId('contractId'),
    validateAllowedFields(ALLOWED_BONUS_FIELDS),
    async (req, res) => {
        try {
            const contract = await Contract.findById(req.params.contractId);

            if (!contract) {
                return res.status(404).json({
                    error: 'Contract not found',
                    _links: { collection: '/api/v1/contracts' }
                });
            }

            contract.bonuses.push(req.body);
            await contract.save();

            const newBonusIndex = contract.bonuses.length - 1;
            const newBonus = contract.bonuses[newBonusIndex];

            res.setHeader('Location', `/api/v1/contracts/${contract._id}/bonuses/${newBonusIndex}`);
            res.setHeader('X-Resource-Type', 'Bonus');
            res.setHeader('X-Resource-Id', `${contract._id}-${newBonusIndex}`);

            res.status(201).json({
                data: newBonus,
                _links: {
                    self: `/api/v1/contracts/${contract._id}/bonuses/${newBonusIndex}`,
                    collection: `/api/v1/contracts/${contract._id}/bonuses`,
                    contract: `/api/v1/contracts/${contract._id}`
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/contracts' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/contracts' }
            });
        }
});

/**
 * @swagger
 * /contracts/{id}/bonuses/{bonusIndex}:
 *   put:
 *     summary: Update specific bonus
 *     tags: [Bonuses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *       - in: path
 *         name: bonusIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bonus index in array
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Bonus'
 *     responses:
 *       200:
 *         description: Bonus updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Bonus'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Contract or bonus not found
 *       500:
 *         description: Server error
 */
contractRouter.put('/:contractId/bonuses/:bonusIndex',
    validateObjectId('contractId'),
    validateAllowedFields(ALLOWED_BONUS_FIELDS),
    async (req, res) => {
        try {
            const contract = await Contract.findById(req.params.contractId);
            const bonusIndex = parseInt(req.params.bonusIndex);

            if (!contract) {
                return res.status(404).json({
                    error: 'Contract not found',
                    _links: { collection: '/api/v1/contracts' }
                });
            }

            if (bonusIndex >= contract.bonuses.length || bonusIndex < 0) {
                return res.status(404).json({
                    error: 'Bonus not found',
                    _links: {
                        collection: `/api/v1/contracts/${contract._id}/bonuses`,
                        contract: `/api/v1/contracts/${contract._id}`
                    }
                });
            }

            contract.bonuses[bonusIndex] = req.body;
            await contract.save();

            res.setHeader('X-Resource-Type', 'Bonus');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('X-Resource-Id', `${contract._id}-${bonusIndex}`);

            res.status(200).json({
                data: contract.bonuses[bonusIndex],
                _links: {
                    self: `/api/v1/contracts/${contract._id}/bonuses/${bonusIndex}`,
                    collection: `/api/v1/contracts/${contract._id}/bonuses`,
                    contract: `/api/v1/contracts/${contract._id}`
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    _links: { collection: '/api/v1/contracts' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/contracts' }
            });
        }
});

/**
 * @swagger
 * /contracts/{id}/bonuses/{bonusIndex}:
 *   delete:
 *     summary: Delete specific bonus
 *     tags: [Bonuses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *       - in: path
 *         name: bonusIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bonus index in array
 *     responses:
 *       204:
 *         description: Bonus deleted
 *       404:
 *         description: Contract or bonus not found
 *       500:
 *          description: Server error
 */
contractRouter.delete('/:contractId/bonuses/:bonusIndex',
    validateObjectId('contractId'),
    async (req, res) => {
        try {
            const contract = await Contract.findById(req.params.contractId);
            const bonusIndex = parseInt(req.params.bonusIndex);

            if (!contract) {
                return res.status(404).json({
                    error: 'Contract not found',
                    _links: { collection: '/api/v1/contracts' }
                });
            }

            if (bonusIndex >= contract.bonuses.length || bonusIndex < 0) {
                return res.status(404).json({
                    error: 'Bonus not found',
                    _links: {
                        collection: `/api/v1/contracts/${contract._id}/bonuses`,
                        contract: `/api/v1/contracts/${contract._id}`
                    }
                });
            }

            contract.bonuses.splice(bonusIndex, 1);
            await contract.save();

            res.setHeader('X-Resource-Type', 'Bonus');
            res.setHeader('X-Resource-Id', `${contract._id}-${bonusIndex}`);
            res.setHeader('X-Deleted-At', new Date().toUTCString());

            res.status(204).end();
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/contracts' }
            });
        }
});