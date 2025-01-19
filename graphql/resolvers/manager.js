import { Manager } from '../../rest/models/Manager.js';

const buildFilterConditions = (filter) => {
    const conditions = {};
    if (!filter) return conditions;

    if (filter.name) {
        const { eq, ne, contains, notContains } = filter.name;
        if (eq) conditions.name = eq;
        if (ne) conditions.name = { $ne: ne };
        if (contains) conditions.name = { $regex: contains, $options: 'i' };
        if (notContains) conditions.name = { $not: new RegExp(notContains, 'i') };
    }

    if (filter.nationality) {
        const { eq, ne, contains, notContains } = filter.nationality;
        if (eq) conditions.nationality = eq;
        if (ne) conditions.nationality = { $ne: ne };
        if (contains) conditions.nationality = { $regex: contains, $options: 'i' };
        if (notContains) conditions.nationality = { $not: new RegExp(notContains, 'i') };
    }

    if (filter.status) conditions.status = filter.status;

    return conditions;
};

const managerResolvers = {
    Query: {
        managers: async (_, { filter, sort, pagination }) => {
            try {
                let query = Manager.find(buildFilterConditions(filter));

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
                throw new Error(`Error fetching managers: ${error.message}`);
            }
        },

        manager: async (_, { id }) => {
            try {
                const manager = await Manager.findById(id);
                if (!manager) {
                    throw new Error('Manager not found');
                }
                return manager;
            } catch (error) {
                throw new Error(`Error fetching manager: ${error.message}`);
            }
        }
    },

    Mutation: {
        createManager: async (_, { input }) => {
            try {
                const manager = new Manager(input);
                await manager.save();
                return manager;
            } catch (error) {
                throw new Error(`Error creating manager: ${error.message}`);
            }
        },

        updateManager: async (_, { id, input }) => {
            try {
                const manager = await Manager.findByIdAndUpdate(
                    id,
                    { $set: input },
                    { new: true, runValidators: true }
                );

                if (!manager) {
                    throw new Error('Manager not found');
                }

                return manager;
            } catch (error) {
                throw new Error(`Error updating manager: ${error.message}`);
            }
        },

        deleteManager: async (_, { id }) => {
            try {
                const result = await Manager.findByIdAndDelete(id);
                return !!result;
            } catch (error) {
                throw new Error(`Error deleting manager: ${error.message}`);
            }
        }
    }
};

export default managerResolvers;