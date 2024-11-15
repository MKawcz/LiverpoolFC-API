import { GraphQLDateTime } from 'graphql-scalars';
import { Player } from '../models/Player.js';
import { Match } from '../models/Match.js';
import { Trophy } from '../models/Trophy.js';
import { Manager } from '../models/Manager.js';
import { Stadium } from '../models/Stadium.js';

export const resolvers = {
    DateTime: GraphQLDateTime,
    Query: {
        players: async () => await Player.find({}, 'id name position nationality'),
        player: async (_, { id }) => await Player.findById(id, 'id name position nationality stats contract'),
        matches: async () => await Match.find({}, 'id date opponent score').populate('stadiumId', 'name location'),
        match: async (_, { id }) => 
            await Match.findById(id, 'id date opponent score lineup')
                       .populate('stadiumId', 'name capacity location')
                       .populate('goals.playerId', 'name position'),
        trophies: async () => await Trophy.find({}, 'id name finalsWon').populate('topScorer', 'name position'),
        trophy: async (_, { id }) =>
            await Trophy.findById(id, 'id name finalsWon seasons')
                        .populate('topScorer', 'name position')
                        .populate('seasons.managerId', 'name nationality'),
        managers: async () => await Manager.find({}, 'id name nationality'),
        manager: async (_, { id }) => await Manager.findById(id, 'id name nationality dateOfBirth'),
        stadiums: async () => await Stadium.find({}, 'id name capacity location'),
        stadium: async (_, { id }) => await Stadium.findById(id, 'id name capacity location'),
    },
    Mutation: {
        addPlayer: async (_, { name, position, nationality }) => {
            if (!name || !position || !nationality) {
                throw new Error('Missing required fields: name, position, nationality');
            }
            const player = new Player({ name, position, nationality });
            await player.save();
            return player;
        },
        addManager: async (_, { name, nationality, dateOfBirth }) => {
            if (!name || !nationality || !dateOfBirth) {
                throw new Error('Missing required fields: name, nationality, dateOfBirth');
            }
            const manager = new Manager({ name, nationality, dateOfBirth });
            await manager.save();
            return manager;
        },
        addMatch: async (_, { date, opponent, score, stadiumId }) => {
            const stadium = await Stadium.findById(stadiumId);
            if (!stadium) throw new Error('Stadium not found');
            const match = new Match({ date, opponent, score, stadiumId });
            await match.save();
            return match;
        },
        addTrophy: async (_, { name, finalsWon }) => {
            if (!name || finalsWon === undefined) {
                throw new Error('Missing required fields: name, finalsWon');
            }
            const trophy = new Trophy({ name, finalsWon });
            await trophy.save();
            return trophy;
        },
        addSeason: async (_, { trophyId, year, matchesWon, managerId }) => {
            const trophy = await Trophy.findById(trophyId);
            if (!trophy) throw new Error('Trophy not found');
            trophy.seasons.push({ year, matchesWon, managerId });
            await trophy.save();
            return trophy;
        },
    },
    Trophy: {
        topScorer: async (parent) => await Player.findById(parent.topScorer),
        seasons: async (parent) =>
            parent.seasons.map((season) => ({
                ...season.toObject(),
                manager: async () => await Manager.findById(season.managerId),
            })),
    },
    Match: {
        stadium: async (parent) => await Stadium.findById(parent.stadiumId),
        goals: async (parent) =>
            parent.goals.map((goal) => ({
                ...goal.toObject(),
                player: async () => await Player.findById(goal.playerId),
            })),
    },
};
