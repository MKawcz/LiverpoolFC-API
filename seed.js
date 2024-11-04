import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { Player } from './models/Player.js';
import { Match } from './models/Match.js';
import { Trophy } from './models/Trophy.js';
import fs from 'fs';

await connectDB();

const importData = async () => {
  try {
    const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));

    await Player.deleteMany();
    await Match.deleteMany();
    await Trophy.deleteMany();

    const players = await Player.insertMany(data.players);

    const playerIdMap = {
      "playerId_placeholder_1": players[0]._id,
      "playerId_placeholder_2": players[1]._id,
      "playerId_placeholder_3": players[2]._id
    };

    const matches = data.matches.map(match => ({
      ...match,
      goals: match.goals.map(goal => ({
        ...goal,
        playerId: playerIdMap[goal.playerId]
      })),
      lineup: {
        starting: match.lineup.starting.map(id => playerIdMap[id]),
        substitutes: match.lineup.substitutes.map(id => playerIdMap[id])
      }
    }));

    const trophies = data.trophies.map(trophy => ({
      ...trophy,
      topScorer: playerIdMap[trophy.topScorer],
    }));

    await Match.insertMany(matches);
    await Trophy.insertMany(trophies);

    console.log('Data imported');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

importData();
