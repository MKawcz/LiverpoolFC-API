import { PlayerStats } from '../../rest/models/PlayerStats.js';

// Helper function to build nested filter conditions
const buildNestedFilterConditions = (filter, basePath = '') => {
    const conditions = {};

    // Handle nested filters with NumberFilter
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

    // Handle nested filters for goals and cards
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
                // Build filter conditions
                let query = PlayerStats.find(buildFilterConditions(filter));

                // Populate related data (if any references exist)
                query = query
                    .populate('player')  // Assuming there's a player reference
                    .populate('season');  // Assuming stats might be linked to a season

                // Implement sorting
                if (sort) {
                    const sortDirection = sort.direction === 'DESC' ? -1 : 1;
                    query = query.sort({ [sort.field]: sortDirection });
                }

                // Implement pagination
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
                const playerStats = await PlayerStats.findById(id)
                    .populate('player')
                    .populate('season');

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
                // Create a new PlayerStats document
                const playerStats = new PlayerStats(input);

                // Save the document
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
                        new: true,        // Return the updated document
                        runValidators: true  // Run model validation
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
                // Find and delete the player stats
                const result = await PlayerStats.findByIdAndDelete(id);

                // Return true if a document was deleted, false otherwise
                return !!result;
            } catch (error) {
                throw new Error(`Error deleting player stats: ${error.message}`);
            }
        }
    }
};

export default playerStatsResolvers;