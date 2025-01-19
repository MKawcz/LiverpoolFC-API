import { PlayerStats } from '../../rest/models/PlayerStats.js';

const buildNestedFilterConditions = (filter, basePath = '') => {
    const conditions = {};

    Object.keys(filter || {}).forEach(key => {
        const value = filter[key];
        if (typeof value === 'object') {
            const { eq, ne, gt, lt, gte, lte } = value;
            const fullPath = basePath ? `${basePath}.${key}` : key;

            if (eq !== undefined) conditions[fullPath] = eq;
            if (ne !== undefined) conditions[fullPath] = { $ne: ne };
            if (gt !== undefined) conditions[fullPath] = { $gt: gt };
            if (lt !== undefined) conditions[fullPath] = { $lt: lt };
            if (gte !== undefined) conditions[fullPath] = { $gte: gte };
            if (lte !== undefined) conditions[fullPath] = { $lte: lte };
        }
    });

    return conditions;
};

const buildFilterConditions = (filter) => {
    if (!filter) return {};

    const conditions = {};

    // Handle top-level numeric filters
    const numericFields = [
        'appearances', 'minutesPlayed', 'assists',
        'tackles', 'interceptions', 'clearances',
        'cleanSheets', 'saves'
    ];

    numericFields.forEach(field => {
        const fieldFilter = filter[field];
        if (fieldFilter) {
            const { eq, ne, gt, lt, gte, lte } = fieldFilter;
            if (eq !== undefined) conditions[field] = eq;
            if (ne !== undefined) conditions[field] = { $ne: ne };
            if (gt !== undefined) conditions[field] = { $gt: gt };
            if (lt !== undefined) conditions[field] = { $lt: lt };
            if (gte !== undefined) conditions[field] = { $gte: gte };
            if (lte !== undefined) conditions[field] = { $lte: lte };
        }
    });

    if (filter.goals) {
        const goalsConditions = buildNestedFilterConditions(filter.goals, 'goals');
        Object.assign(conditions, goalsConditions);
    }

    if (filter.cards) {
        const cardsConditions = buildNestedFilterConditions(filter.cards, 'cards');
        Object.assign(conditions, cardsConditions);
    }

    return conditions;
};

const playerStatsResolvers = {
    Query: {
        playerStats: async (_, { filter, sort, pagination }) => {
            try {
                let query = PlayerStats.find(buildFilterConditions(filter));

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
                throw new Error(`Error fetching player stats: ${error.message}`);
            }
        },

        singlePlayerStats: async (_, { id }) => {
            try {
                const playerStats = await PlayerStats.findById(id);

                if (!playerStats) {
                    throw new Error('Player stats not found');
                }

                return playerStats;
            } catch (error) {
                throw new Error(`Error fetching player stats: ${error.message}`);
            }
        }
    },

    Mutation: {
        createPlayerStats: async (_, { input }) => {
            try {
                const playerStats = new PlayerStats(input);

                await playerStats.save();

                return playerStats;
            } catch (error) {
                throw new Error(`Error creating player stats: ${error.message}`);
            }
        },

        updatePlayerStats: async (_, { id, input }) => {
            try {
                // Find and update the player stats
                const playerStats = await PlayerStats.findByIdAndUpdate(
                    id,
                    { $set: input },
                    {
                        new: true,
                        runValidators: true
                    }
                );

                if (!playerStats) {
                    throw new Error('Player stats not found');
                }

                return playerStats;
            } catch (error) {
                throw new Error(`Error updating player stats: ${error.message}`);
            }
        },

        deletePlayerStats: async (_, { id }) => {
            try {
                const result = await PlayerStats.findByIdAndDelete(id);

                return !!result;
            } catch (error) {
                throw new Error(`Error deleting player stats: ${error.message}`);
            }
        }
    }
};

export default playerStatsResolvers;