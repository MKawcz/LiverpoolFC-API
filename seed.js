import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { Player } from './models/Player.js';
import { Match } from './models/Match.js';
import { Trophy } from './models/Trophy.js';
import { Manager } from './models/Manager.js';
import { Stadium } from './models/Stadium.js';
import fs from 'fs';

await connectDB();

const importData = async () => {
  try {
    const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));

    await Player.deleteMany();
    await Match.deleteMany();
    await Trophy.deleteMany();
    await Manager.deleteMany();
    await Stadium.deleteMany();

    const players = await Player.insertMany(data.players);
    const managers = await Manager.insertMany(data.managers);
    const stadiums = await Stadium.insertMany(data.stadiums);

    const playerIdMap = players.reduce((map, player, index) => {
      map[`playerId_placeholder_${index + 1}`] = player._id;
      return map;
    }, {});

    const managerIdMap = managers.reduce((map, manager, index) => {
      map[`managerId_placeholder_${index + 1}`] = manager._id;
      return map;
    }, {});

    const stadiumIdMap = stadiums.reduce((map, stadium, index) => {
      map[`stadiumId_placeholder_${index + 1}`] = stadium._id;
      return map;
    }, {});

    const matches = data.matches.map(match => ({
      ...match,
      stadiumId: stadiumIdMap[match.stadiumId],
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
      seasons: trophy.seasons.map(season => ({
        ...season,
        managerId: managerIdMap[season.managerId]
      }))
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
