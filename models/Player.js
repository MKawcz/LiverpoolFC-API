import mongoose from 'mongoose';

const BonusSchema = new mongoose.Schema({
    goal: Number,
    assist: Number,
}, { _id: false });

const ContractSchema = new mongoose.Schema({
    start: Date,
    end: Date,
    salary: Number,
    bonuses: BonusSchema,
}, { _id: false });

const StatSchema = new mongoose.Schema({
    appearances: Number,
    goals: Number,
    assists: Number,
    yellowCards: Number,
    redCards: Number,
}, { _id: false });

const PlayerSchema = new mongoose.Schema({
    name: String,
    position: String,
    nationality: String,
    stats: StatSchema,
    contract: ContractSchema,
});

export const Player = mongoose.model('Player', PlayerSchema);
