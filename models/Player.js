import mongoose from 'mongoose';

const BonusSchema = new mongoose.Schema({
    goal: { type: Number, required: true },
    assist: { type: Number, required: true },
}, { _id: false });

const ContractSchema = new mongoose.Schema({
    start: { type: Date, required: true },
    end: {type: Date, required: true },
    salary: { type: Number, requierd: true },
    bonuses: BonusSchema,
}, { _id: false });

const StatSchema = new mongoose.Schema({
    appearances: { type: Number, requierd: true },
    goals: { type: Number, requierd: true },
    assists: { type: Number, requierd: true },
    yellowCards: { type: Number, requierd: true },
    redCards: { type: Number, requierd: true },
}, { _id: false });

const PlayerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    position: { type: String, required: true },
    nationality: { type: String, required: true },
    stats: StatSchema,
    contract: ContractSchema,
});

export const Player = mongoose.model('Player', PlayerSchema);
