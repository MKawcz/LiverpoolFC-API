import mongoose from 'mongoose';

const StadiumSchema = new mongoose.Schema({
    name: String,
    capacity: Number,
    location: String,
}, { _id: false });

const GoalSchema = new mongoose.Schema({
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    minute: Number,
});

const LineupSchema = new mongoose.Schema({
    starting: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    substitutes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
}, { _id: false });

const MatchSchema = new mongoose.Schema({
    date: Date,
    opponent: String,
    score: String,
    stadium: StadiumSchema,
    goals: [GoalSchema],
    lineup: LineupSchema,
});

export const Match = mongoose.model('Match', MatchSchema);
