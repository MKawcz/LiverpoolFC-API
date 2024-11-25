import mongoose from "mongoose";

const PlayerStatsSchema = new mongoose.Schema({
    appearances: { type: Number, required: true, min: 0 },
    goals: { type: Number, required: true, min: 0 },
    assists: { type: Number, required: true, min: 0 },
    yellowCards: { type: Number, required: true, min: 0 },
    redCards: { type: Number, required: true, min: 0 },
    season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season' },
});

export const PlayerStats = mongoose.model('PlayerStats', PlayerStatsSchema);