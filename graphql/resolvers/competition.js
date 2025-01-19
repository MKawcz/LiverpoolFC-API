import { Competition } from '../../rest/models/Competition.js';

// Funkcja pomocnicza do budowania warunków filtrowania
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

    if (filter.type) conditions.type = filter.type;

    if (filter.yearOfCreation) {
        const { eq, ne, gt, lt, gte, lte } = filter.yearOfCreation;
        if (eq) conditions.yearOfCreation = eq;
        if (ne) conditions.yearOfCreation = { $ne: ne };
        if (gt) conditions.yearOfCreation = { $gt: gt };
        if (lt) conditions.yearOfCreation = { $lt: lt };
        if (gte) conditions.yearOfCreation = { $gte: gte };
        if (lte) conditions.yearOfCreation = { $lte: lte };
    }

    return conditions;
};

const competitionResolvers = {
    Query: {
        competitions: async (_, { filter, sort, pagination }) => {
            try {
                let query = Competition.find(buildFilterConditions(filter));

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
                throw new Error(`Error fetching competitions: ${error.message}`);
            }
        },

        competition: async (_, { id }) => {
            try {
                const competition = await Competition.findById(id);
                if (!competition) {
                    throw new Error('Competition not found');
                }
                return competition;
            } catch (error) {
                throw new Error(`Error fetching competition: ${error.message}`);
            }
        }
    },

    Mutation: {
        createCompetition: async (_, { input }) => {
            try {
                const competition = new Competition(input);
                await competition.save();
                return competition;
            } catch (error) {
                throw new Error(`Error creating competition: ${error.message}`);
            }
        },

        updateCompetition: async (_, { id, input }) => {
            try {
                const competition = await Competition.findByIdAndUpdate(
                    id,
                    { $set: input },
                    { new: true, runValidators: true }
                );

                if (!competition) {
                    throw new Error('Competition not found');
                }

                return competition;
            } catch (error) {
                throw new Error(`Error updating competition: ${error.message}`);
            }
        },

        deleteCompetition: async (_, { id }) => {
            try {
                const result = await Competition.findByIdAndDelete(id);
                return !!result;
            } catch (error) {
                throw new Error(`Error deleting competition: ${error.message}`);
            }
        }
    }
};

export default competitionResolvers;