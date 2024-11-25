import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    position: {
        type: String,
        required: true,
        enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
    },
    nationality: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    stats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PlayerStats' }],
    contractsHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contract' }],
});

export const Player = mongoose.model('Player', PlayerSchema);
