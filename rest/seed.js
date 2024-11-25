import mongoose from 'mongoose';
import connectDB from '../config/db.js';
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

    await Competition.deleteMany();
    await Contract.deleteMany();
    await Player.deleteMany();
    await Match.deleteMany();
    await Trophy.deleteMany();
    await Manager.deleteMany();
    await Stadium.deleteMany();
    await PlayerStats.deleteMany();
    await Season.deleteMany();

    const competitions = await Competition.insertMany(data.competitions);
    const contracts = await Contract.insertMany(data.contracts);
    const playerStats = await PlayerStats.insertMany(data.playerStats);
    const players = await Player.insertMany(
        data.players.map((player, index) => ({
          ...player,
          stats: [playerStats[index]._id],
          contractsHistory: [contracts[index]._id],
        }))
    );

    const managers = await Manager.insertMany(data.managers);
    const stadiums = await Stadium.insertMany(data.stadiums);
    const seasons = await Season.insertMany(
        data.seasons.map((season, index) => ({
          ...season,
          topScorer: players[index % players.length]._id,
          manager: managers[index % managers.length]._id,
        }))
    );

    const matches = await Match.insertMany(
        data.matches.map((match, index) => ({
          ...match,
          stadium: stadiums[index % stadiums.length]._id,
          season: seasons[index % seasons.length]._id,
          competition: competitions[index % competitions.length]._id,
        }))
    );

    const trophies = await Trophy.insertMany(
        data.trophies.map((trophy, index) => ({
          ...trophy,
          competition: competitions[index % competitions.length]._id,
          seasons: [seasons[index % seasons.length]._id],
        }))
    );

    console.log('Data imported successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
