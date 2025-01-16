import { Stadium } from '../../rest/models/Stadium.js';

const buildFilterConditions = (filter) => {
    const conditions = {};
    if (!filter) return conditions;

    // Filtrowanie po nazwie
    if (filter.name) {
        const { eq, ne, contains, notContains } = filter.name;
        if (eq) conditions.name = eq;
        if (ne) conditions.name = { $ne: ne };
        if (contains) conditions.name = { $regex: contains, $options: 'i' };
        if (notContains) conditions.name = { $not: new RegExp(notContains, 'i') };
    }

    // Filtrowanie po pojemności
    if (filter.capacity) {
        const { eq, ne, gt, lt, gte, lte } = filter.capacity;
        if (eq) conditions.capacity = eq;
        if (ne) conditions.capacity = { $ne: ne };
        if (gt) conditions.capacity = { $gt: gt };
        if (lt) conditions.capacity = { $lt: lt };
        if (gte) conditions.capacity = { $gte: gte };
        if (lte) conditions.capacity = { $lte: lte };
    }

    // Filtrowanie po lokalizacji
    if (filter.location) {
        const { eq, ne, contains, notContains } = filter.location;
        if (eq) conditions.location = eq;
        if (ne) conditions.location = { $ne: ne };
        if (contains) conditions.location = { $regex: contains, $options: 'i' };
        if (notContains) conditions.location = { $not: new RegExp(notContains, 'i') };
    }

    return conditions;
};

const stadiumResolvers = {
    Query: {
        stadiums: async (_, { filter, sort, pagination }) => {
            try {
                let query = Stadium.find(buildFilterConditions(filter));

                // Implementacja sortowania
                if (sort) {
                    const sortDirection = sort.direction === 'DESC' ? -1 : 1;
                    query = query.sort({ [sort.field]: sortDirection });
                }

                // Implementacja paginacji
                if (pagination) {
                    const { page, pageSize } = pagination;
                    query = query.skip((page - 1) * pageSize).limit(pageSize);
                }

                return await query.exec();
            } catch (error) {
                throw new Error(`Error fetching stadiums: ${error.message}`);
            }
        },

        stadium: async (_, { id }) => {
            try {
                const stadium = await Stadium.findById(id);
                if (!stadium) {
                    throw new Error('Stadium not found');
                }
                return stadium;
            } catch (error) {
                throw new Error(`Error fetching stadium: ${error.message}`);
            }
        }
    },

    Mutation: {
        createStadium: async (_, { input }) => {
            try {
                const stadium = new Stadium({
                    ...input,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                await stadium.save();
                return stadium;
            } catch (error) {
                throw new Error(`Error creating stadium: ${error.message}`);
            }
        },

        updateStadium: async (_, { id, input }) => {
            try {
                const stadium = await Stadium.findByIdAndUpdate(
                    id,
                    {
                        $set: {
                            ...input,
                            updatedAt: new Date()
                        }
                    },
                    {
                        new: true,
                        runValidators: true
                    }
                );

                if (!stadium) {
                    throw new Error('Stadium not found');
                }

                return stadium;
            } catch (error) {
                throw new Error(`Error updating stadium: ${error.message}`);
            }
        },

        deleteStadium: async (_, { id }) => {
            try {
                const result = await Stadium.findByIdAndDelete(id);
                return !!result;
            } catch (error) {
                throw new Error(`Error deleting stadium: ${error.message}`);
            }
        }
    }
};

export default stadiumResolvers;