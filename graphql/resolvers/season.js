import { Season } from '../../rest/models/Season.js';

const buildFilterConditions = (filter) => {
    const conditions = {};
    if (!filter) return conditions;

    if (filter.years) {
        const { eq, ne, contains, notContains } = filter.years;
        if (eq) conditions.years = eq;
        if (ne) conditions.years = { $ne: ne };
        if (contains) conditions.years = { $regex: contains, $options: 'i' };
        if (notContains) conditions.years = { $not: new RegExp(notContains, 'i') };
    }

    if (filter.manager) conditions.manager = filter.manager;

    if (filter.status) conditions.status = filter.status;

    return conditions;
};

const seasonResolvers = {
    Query: {
        seasons: async (_, { filter, sort, pagination }) => {
            try {
                let query = Season.find(buildFilterConditions(filter));

                query = query
                    .populate('trophies')
                    .populate('manager');

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
                throw new Error(`Error fetching seasons: ${error.message}`);
            }
        },

        season: async (_, { id }) => {
            try {
                const season = await Season.findById(id)
                    .populate('trophies')
                    .populate('manager');

                if (!season) {
                    throw new Error('Season not found');
                }

                return season;
            } catch (error) {
                throw new Error(`Error fetching season: ${error.message}`);
            }
        }
    },

    Mutation: {
        createSeason: async (_, { input }) => {
            try {
                const season = new Season({
                    ...input,
                    trophies: []
                });

                await season.save();

                return season;
            } catch (error) {
                throw new Error(`Error creating season: ${error.message}`);
            }
        },

        updateSeason: async (_, { id, input }) => {
            try {
                const season = await Season.findByIdAndUpdate(
                    id,
                    { $set: input },
                    {
                        new: true,
                        runValidators: true
                    }
                )
                    .populate('trophies')
                    .populate('manager');

                if (!season) {
                    throw new Error('Season not found');
                }

                return season;
            } catch (error) {
                throw new Error(`Error updating season: ${error.message}`);
            }
        },

        deleteSeason: async (_, { id }) => {
            try {
                const result = await Season.findByIdAndDelete(id);

                return !!result;
            } catch (error) {
                throw new Error(`Error deleting season: ${error.message}`);
            }
        }
    },
};

export default seasonResolvers;