import matchResolvers from './match.js';
import scalarResolvers from '../scalars/index.js';
import competitionResolvers from "./competition.js";
import contractResolvers from "./contract.js";
import managerResolvers from "./manager.js";
import playerResolvers from "./player.js";
import seasonResolvers from "./season.js";
import stadiumResolvers from "./stadium.js";
import trophyResolvers from "./trophy.js";
import playerStatsResolvers from "./playerStats.js";

// Łączymy wszystkie resolwery
const resolvers = {
    ...scalarResolvers,    // Dodajemy nasze skalary (np. DateTime)
    ...matchResolvers,
    ...competitionResolvers,
    ...contractResolvers,
    ...managerResolvers,
    ...playerResolvers,
    ...seasonResolvers,
    ...stadiumResolvers,
    ...trophyResolvers,
    ...playerStatsResolvers
};

export default resolvers;