import connectDB from './config/db.js';
import { Player } from './models/Player.js';
import { Match } from './models/Match.js';
import { Trophy } from './models/Trophy.js';
import { Manager } from './models/Manager.js';
import { Stadium } from './models/Stadium.js';
import { Contract } from './models/Contract.js';
import { PlayerStats } from './models/PlayerStats.js';
import { Season } from './models/Season.js';
import { Competition } from './models/Competition.js';
import fs from 'fs';

await connectDB();

const importData = async () => {
    try {
        const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));

        // Clear all collections first
        await Competition.deleteMany();
        await Contract.deleteMany();
        await Player.deleteMany();
        await Match.deleteMany();
        await Trophy.deleteMany();
        await Manager.deleteMany();
        await Stadium.deleteMany();
        await PlayerStats.deleteMany();
        await Season.deleteMany();

        // Insert base data first
        const competitions = await Competition.insertMany(data.competitions);
        const managers = await Manager.insertMany(data.managers);
        const stadiums = await Stadium.insertMany(data.stadiums);

        // Insert player-related data
        const playerStats = await PlayerStats.insertMany(data.playerStats);
        const contracts = await Contract.insertMany(data.contracts);

        const players = await Player.insertMany(
            data.players.map((player, index) => ({
                ...player,
                stats: playerStats[index]._id,
                currentContract: contracts[index]._id,
                contractsHistory: [contracts[index]._id]
            }))
        );

        // Insert seasons with references
        const seasons = await Season.insertMany(
            data.seasons.map((season, index) => ({
                ...season,
                manager: managers[index % managers.length]._id
            }))
        );

        // Insert matches with references
        const matches = await Match.insertMany(
            data.matches.map((match, index) => ({
                ...match,
                season: seasons[index % seasons.length]._id,
                competition: competitions[index % competitions.length]._id,
                stadium: stadiums[index % stadiums.length]._id,
                'lineup.starting': Array(11).fill({ player: players[0]._id }),
                'lineup.substitutes': Array(7).fill({ player: players[1]._id }),
                goals: [
                    {
                        scorer: players[0]._id,
                        assistant: players[2]._id,
                        minute: 23,
                        description: "Great team play"
                    }
                ]
            }))
        );

        // Insert trophies with references
        const trophies = await Trophy.insertMany(
            data.trophies.map((trophy, index) => ({
                ...trophy,
                competition: competitions[index % competitions.length]._id
            }))
        );

        // Update seasons with trophies
        await Season.updateMany(
            { status: 'FINISHED' },
            { $push: { trophies: { $each: trophies.map(t => t._id) } } }
        );

        // Update seasons with top scorers
        const topScorerUpdates = seasons.map((season, index) => ({
            updateOne: {
                filter: { _id: season._id },
                update: {
                    $set: {
                        'topScorer.player': players[0]._id,
                        'topScorer.goals': 25,
                        'topAssister.player': players[2]._id,
                        'topAssister.assists': 15
                    }
                }
            }
        }));

        await Season.bulkWrite(topScorerUpdates);

        console.log('Data imported successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();