import mongoose from 'mongoose';

const TrophySchema = new mongoose.Schema({
    competition: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Competition',
        required: true
    },
    wonDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value <= new Date();

            },
            message: 'Date of winning the trophy cannot be in the future'
        }
    },
    prizes: {
        winner: { type: Number, required: true, min: 0 },
        runnerUp: { type: Number, min: 0 },
        thirdPlace: { type: Number, min: 0 }
    },
    // bonuses: {
    //     forWinning: { type: Number, required: true, min: 0 },
    //     forDrawing: { type: Number, required: true, min: 0 },
    //     forCleanSheet: { type: Number, required: true, min: 0 }
    // },
}, {
    timestamps: true
});

export const Trophy = mongoose.model('Trophy', TrophySchema);
