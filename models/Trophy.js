import mongoose from 'mongoose';

const SeasonSchema = new mongoose.Schema({
    year: { type: Number, required: true },
    matchesWon: { type: Number, required: true },
});

const TrophySchema = new mongoose.Schema({
    name: { type: String, required: true },
    topScorer: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    finalsWon: { type: Number, required: true },
    seasons: [SeasonSchema],
});

export const Trophy = mongoose.model('Trophy', TrophySchema);
