// src/graphql/resolvers/player.js
import { Player } from '../../rest/models/Player.js';

const buildFilterConditions = (filter) => {
    const conditions = {};
    if (!filter) return conditions;

    // Filtrowanie po imieniu i nazwisku
    if (filter.name) {
        const { eq, ne, contains, notContains } = filter.name;
        // Szukamy zarówno w imieniu jak i nazwisku
        if (eq) {
            conditions.$or = [
                { 'name.first': eq },
                { 'name.last': eq }
            ];
        }
        if (ne) {
            conditions.$and = [
                { 'name.first': { $ne: ne } },
                { 'name.last': { $ne: ne } }
            ];
        }
        if (contains) {
            conditions.$or = [
                { 'name.first': { $regex: contains, $options: 'i' } },
                { 'name.last': { $regex: contains, $options: 'i' } }
            ];
        }
        if (notContains) {
            conditions.$and = [
                { 'name.first': { $not: new RegExp(notContains, 'i') } },
                { 'name.last': { $not: new RegExp(notContains, 'i') } }
            ];
        }
    }

    // Filtrowanie po pozycji
    if (filter.position) conditions.position = filter.position;

    // Filtrowanie po narodowości
    if (filter.nationality) {
        const { eq, ne, contains, notContains } = filter.nationality;
        if (eq) conditions.nationality = eq;
        if (ne) conditions.nationality = { $ne: ne };
        if (contains) conditions.nationality = { $regex: contains, $options: 'i' };
        if (notContains) conditions.nationality = { $not: new RegExp(notContains, 'i') };
    }

    // Filtrowanie po statusie
    if (filter.status) conditions.status = filter.status;

    // Filtrowanie po numerze na koszulce
    if (filter.jerseyNumber) {
        const { eq, ne, gt, lt, gte, lte } = filter.jerseyNumber;
        if (eq) conditions.jerseyNumber = eq;
        if (ne) conditions.jerseyNumber = { $ne: ne };
        if (gt) conditions.jerseyNumber = { $gt: gt };
        if (lt) conditions.jerseyNumber = { $lt: lt };
        if (gte) conditions.jerseyNumber = { $gte: gte };
        if (lte) conditions.jerseyNumber = { $lte: lte };
    }

    return conditions;
};

const playerResolvers = {
    Query: {
        players: async (_, { filter, sort, pagination }) => {
            try {
                let query = Player.find(buildFilterConditions(filter));

                // Dodajemy populację powiązanych danych
                query = query
                    .populate('currentContract')
                    .populate('stats');

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
                throw new Error(`Error fetching players: ${error.message}`);
            }
        },

        player: async (_, { id }) => {
            try {
                const player = await Player.findById(id)
                    .populate('currentContract')
                    .populate('stats');

                if (!player) {
                    throw new Error('Player not found');
                }

                return player;
            } catch (error) {
                throw new Error(`Error fetching player: ${error.message}`);
            }
        }
    },

    Mutation: {
        createPlayer: async (_, { input }) => {
            try {
                const player = new Player(input);
                await player.save();
                return player;
            } catch (error) {
                throw new Error(`Error creating player: ${error.message}`);
            }
        },

        updatePlayer: async (_, { id, input }) => {
            try {
                const player = await Player.findByIdAndUpdate(
                    id,
                    { $set: input },
                    { new: true, runValidators: true }
                )
                    .populate('currentContract')
                    .populate('stats');

                if (!player) {
                    throw new Error('Player not found');
                }

                return player;
            } catch (error) {
                throw new Error(`Error updating player: ${error.message}`);
            }
        },

        deletePlayer: async (_, { id }) => {
            try {
                const result = await Player.findByIdAndDelete(id);
                return !!result;
            } catch (error) {
                throw new Error(`Error deleting player: ${error.message}`);
            }
        }
    }
};

export default playerResolvers;