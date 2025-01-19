import { Match } from '../../rest/models/Match.js';

const buildFilterConditions = (filter) => {
    const conditions = {};

    if (!filter) return conditions;

    if (filter.opponentName) {
        const { eq, ne, contains, notContains } = filter.opponentName;
        if (eq) conditions['opponent.name'] = eq;
        if (ne) conditions['opponent.name'] = { $ne: ne };
        if (contains) conditions['opponent.name'] = { $regex: contains, $options: 'i' };
        if (notContains) conditions['opponent.name'] = { $not: new RegExp(contains, 'i') };
    }

    if (filter.date) {
        const dateConditions = {};
        const { eq, ne, gt, lt, gte, lte } = filter.date;

        if (eq) dateConditions.$eq = new Date(eq);
        if (ne) dateConditions.$ne = new Date(ne);
        if (gt) dateConditions.$gt = new Date(gt);
        if (lt) dateConditions.$lt = new Date(lt);
        if (gte) dateConditions.$gte = new Date(gte);
        if (lte) dateConditions.$lte = new Date(lte);

        if (Object.keys(dateConditions).length > 0) {
            conditions.date = dateConditions;
        }
    }

    if (filter.season) conditions.season = filter.season;
    if (filter.competition) conditions.competition = filter.competition;
    if (filter.stadium) conditions.stadium = filter.stadium;

    if (filter.home !== undefined) conditions.home = filter.home;

    return conditions;
};

const matchResolvers = {
    Query: {
        matches: async (_, { filter, sort, pagination }) => {
            try {
                let query = Match.find(buildFilterConditions(filter));

                if (sort) {
                    const sortDirection = sort.direction === 'DESC' ? -1 : 1;
                    query = query.sort({ [sort.field]: sortDirection });
                }

                if (pagination) {
                    const { page, pageSize } = pagination;
                    query = query.skip((page - 1) * pageSize).limit(pageSize);
                }

                query = query
                    .populate('season')
                    .populate('competition')
                    .populate('stadium')
                    .populate('lineup.starting.player')
                    .populate('lineup.substitutes.player')
                    .populate('lineup.substitutions.playerIn')
                    .populate('lineup.substitutions.playerOut')
                    .populate('goals.scorer')
                    .populate('goals.assistant');

                return await query.exec();
            } catch (error) {
                throw new Error(`Error fetching matches: ${error.message}`);
            }
        },

        match: async (_, { id }) => {
            try {
                const match = await Match.findById(id)
                    .populate('season')
                    .populate('competition')
                    .populate('stadium')
                    .populate('lineup.starting.player')
                    .populate('lineup.substitutes.player')
                    .populate('lineup.substitutions.playerIn')
                    .populate('lineup.substitutions.playerOut')
                    .populate('goals.scorer')
                    .populate('goals.assistant');

                if (!match) {
                    throw new Error('Match not found');
                }

                return match;
            } catch (error) {
                throw new Error(`Error fetching match: ${error.message}`);
            }
        }
    },

    Mutation: {
        createMatch: async (_, { input }) => {
            try {
                const match = new Match({
                    ...input,
                    lineup: {
                        starting: [],
                        substitutes: [],
                        substitutions: []
                    }
                });

                await match.save();
                return match;
            } catch (error) {
                throw new Error(`Error creating match: ${error.message}`);
            }
        },

        updateMatch: async (_, { id, input }) => {
            try {
                const match = await Match.findByIdAndUpdate(
                    id,
                    { $set: input },
                    {
                        new: true,        // Zwraca zaktualizowany dokument
                        runValidators: true // Uruchamia walidatory schematu
                    }
                );

                if (!match) {
                    throw new Error('Match not found');
                }

                return match;
            } catch (error) {
                throw new Error(`Error updating match: ${error.message}`);
            }
        },

        deleteMatch: async (_, { id }) => {
            try {
                const result = await Match.findByIdAndDelete(id);
                return !!result; // Zwraca true jeśli mecz został usunięty, false jeśli nie istniał
            } catch (error) {
                throw new Error(`Error deleting match: ${error.message}`);
            }
        }
    },
};

export default matchResolvers;