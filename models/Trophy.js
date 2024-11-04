import mongoose from 'mongoose';

const SeasonSchema = new mongoose.Schema({
    year: Number,
    matchesWon: Number,
});

const TrophySchema = new mongoose.Schema({
    name: String,
    topScorer: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    finalsWon: Number,
    seasons: [SeasonSchema],
});

export const Trophy = mongoose.model('Trophy', TrophySchema);
