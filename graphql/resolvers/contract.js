import { Contract } from '../../rest/models/Contract.js';

const buildFilterConditions = (filter) => {
    const conditions = {};
    if (!filter) return conditions;

    if (filter.start) {
        const dateConditions = {};
        const { eq, ne, gt, lt, gte, lte } = filter.start;

        if (eq) dateConditions.$eq = new Date(eq);
        if (ne) dateConditions.$ne = new Date(ne);
        if (gt) dateConditions.$gt = new Date(gt);
        if (lt) dateConditions.$lt = new Date(lt);
        if (gte) dateConditions.$gte = new Date(gte);
        if (lte) dateConditions.$lte = new Date(lte);

        if (Object.keys(dateConditions).length > 0) {
            conditions.start = dateConditions;
        }
    }

    if (filter.end) {
        const dateConditions = {};
        const { eq, ne, gt, lt, gte, lte } = filter.end;

        if (eq) dateConditions.$eq = new Date(eq);
        if (ne) dateConditions.$ne = new Date(ne);
        if (gt) dateConditions.$gt = new Date(gt);
        if (lt) dateConditions.$lt = new Date(lt);
        if (gte) dateConditions.$gte = new Date(gte);
        if (lte) dateConditions.$lte = new Date(lte);

        if (Object.keys(dateConditions).length > 0) {
            conditions.end = dateConditions;
        }
    }

    if (filter.salaryBase) {
        const { eq, ne, gt, lt, gte, lte } = filter.salaryBase;
        if (eq) conditions['salary.base'] = eq;
        if (ne) conditions['salary.base'] = { $ne: ne };
        if (gt) conditions['salary.base'] = { $gt: gt };
        if (lt) conditions['salary.base'] = { $lt: lt };
        if (gte) conditions['salary.base'] = { $gte: gte };
        if (lte) conditions['salary.base'] = { $lte: lte };
    }

    return conditions;
};

const contractResolvers = {
    Query: {
        contracts: async (_, { filter, sort, pagination }) => {
            try {
                let query = Contract.find(buildFilterConditions(filter));

                if (sort) {
                    const sortDirection = sort.direction === 'DESC' ? -1 : 1;
                    query = query.sort({ [sort.field]: sortDirection });
                }

                if (pagination) {
                    const { page, pageSize } = pagination;
                    query = query.skip((page - 1) * pageSize).limit(pageSize);
                }

                return await query.exec();
            } catch (error) {
                throw new Error(`Error fetching contracts: ${error.message}`);
            }
        },

        contract: async (_, { id }) => {
            try {
                const contract = await Contract.findById(id);
                if (!contract) {
                    throw new Error('Contract not found');
                }
                return contract;
            } catch (error) {
                throw new Error(`Error fetching contract: ${error.message}`);
            }
        }
    },

    Mutation: {
        createContract: async (_, { input }) => {
            try {
                const contract = new Contract(input);
                await contract.save();
                return contract;
            } catch (error) {
                throw new Error(`Error creating contract: ${error.message}`);
            }
        },

        updateContract: async (_, { id, input }) => {
            try {
                const contract = await Contract.findByIdAndUpdate(
                    id,
                    { $set: input },
                    { new: true, runValidators: true }
                );

                if (!contract) {
                    throw new Error('Contract not found');
                }

                return contract;
            } catch (error) {
                throw new Error(`Error updating contract: ${error.message}`);
            }
        },

        deleteContract: async (_, { id }) => {
            try {
                const result = await Contract.findByIdAndDelete(id);
                return !!result;
            } catch (error) {
                throw new Error(`Error deleting contract: ${error.message}`);
            }
        }
    }
};

export default contractResolvers;