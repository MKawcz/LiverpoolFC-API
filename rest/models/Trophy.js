import mongoose from 'mongoose';

const TrophySchema = new mongoose.Schema({
    competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true },
    finalsWon: { type: Number, required: true, min: 0 },
    seasons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true }],
});

export const Trophy = mongoose.model('Trophy', TrophySchema);
