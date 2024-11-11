import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    minute: { type: Number, required: true }
});

const LineupSchema = new mongoose.Schema({
    starting: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    substitutes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
}, { _id: false });

const MatchSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    opponent: { type: String, required: true },
    score: { type: String, required: true },
    stadiumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stadium' },
    goals: [GoalSchema],
    lineup: LineupSchema,
});

export const Match = mongoose.model('Match', MatchSchema);
