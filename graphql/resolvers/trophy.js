import { Trophy } from '../../rest/models/Trophy.js';

const buildFilterConditions = (filter) => {
    const conditions = {};
    if (!filter) return conditions;

    if (filter.competition) conditions.competition = filter.competition;

    if (filter.wonDate) {
        const dateConditions = {};
        const { eq, ne, gt, lt, gte, lte } = filter.wonDate;

        if (eq) dateConditions.$eq = new Date(eq);
        if (ne) dateConditions.$ne = new Date(ne);
        if (gt) dateConditions.$gt = new Date(gt);
        if (lt) dateConditions.$lt = new Date(lt);
        if (gte) dateConditions.$gte = new Date(gte);
        if (lte) dateConditions.$lte = new Date(lte);

        if (Object.keys(dateConditions).length > 0) {
            conditions.wonDate = dateConditions;
        }
    }

    return conditions;
};

const trophyResolvers = {
    Query: {
        trophies: async (_, { filter, sort, pagination }) => {
            try {
                let query = Trophy.find(buildFilterConditions(filter));

                query = query.populate('competition');

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
                throw new Error(`Error fetching trophies: ${error.message}`);
            }
        },

        trophy: async (_, { id }) => {
            try {
                const trophy = await Trophy.findById(id)
                    .populate('competition');

                if (!trophy) {
                    throw new Error('Trophy not found');
                }

                return trophy;
            } catch (error) {
                throw new Error(`Error fetching trophy: ${error.message}`);
            }
        }
    },

    Mutation: {
        createTrophy: async (_, { input }) => {
            try {
                const trophy = new Trophy(input);
                await trophy.save();
                return trophy;
            } catch (error) {
                throw new Error(`Error creating trophy: ${error.message}`);
            }
        },

        updateTrophy: async (_, { id, input }) => {
            try {
                const trophy = await Trophy.findByIdAndUpdate(
                    id,
                    { $set: input },
                    {
                        new: true,
                        runValidators: true
                    }
                ).populate('competition');

                if (!trophy) {
                    throw new Error('Trophy not found');
                }

                return trophy;
            } catch (error) {
                throw new Error(`Error updating trophy: ${error.message}`);
            }
        },

        deleteTrophy: async (_, { id }) => {
            try {
                const result = await Trophy.findByIdAndDelete(id);
                return !!result;
            } catch (error) {
                throw new Error(`Error deleting trophy: ${error.message}`);
            }
        }
    }
};

export default trophyResolvers;