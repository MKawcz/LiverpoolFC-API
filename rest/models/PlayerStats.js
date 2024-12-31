import mongoose from "mongoose";

const PlayerStatsSchema = new mongoose.Schema({
    appearances: {
        type: Number,
        default: 0,
        min: 0,
        required: true
    },
    minutesPlayed: {
        type: Number,
        default: 0,
        min: 0,
        required: true
    },
    goals: {
        total: { type: Number, default: 0, min: 0 },
        penalties: { type: Number, default: 0, min: 0 },
        freeKicks: { type: Number, default: 0, min: 0 }
    },
    assists: { type: Number, default: 0, min: 0 },
    // passes: {
    //     total: { type: Number, default: 0, min: 0 },
    //     accurate: { type: Number, default: 0, min: 0 },
    //     validate: {
    //         validator: function(v) {
    //             return this.passes.accurate <= this.passes.total;
    //         },
    //         message: 'Accurate passes cannot exceed total passes'
    //     }
    // },
    // keyPasses: { type: Number, default: 0, min: 0 },
    tackles: { type: Number, default: 0, min: 0 },
    interceptions: { type: Number, default: 0, min: 0 },
    clearances: { type: Number, default: 0, min: 0 },
    cleanSheets: { type: Number, default: 0, min: 0 },
    saves: { type: Number, default: 0, min: 0 },
    cards: {
        yellow: { type: Number, default: 0, min: 0 },
        red: { type: Number, default: 0, min: 0 }
    }
});

export const PlayerStats = mongoose.model('PlayerStats', PlayerStatsSchema);