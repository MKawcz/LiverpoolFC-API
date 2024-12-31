import mongoose from "mongoose";

// const StatisticsSchema = new mongoose.Schema({
//     matchesPlayed: { type: Number, default: 0, min: 0 },
//     matchesWon: { type: Number, default: 0, min: 0 },
//     matchesDrawn: { type: Number, default: 0, min: 0 },
//     matchesLost: { type: Number, default: 0, min: 0 },
//     goalsFor: { type: Number, default: 0, min: 0 },
//     goalsAgainst: { type: Number, default: 0, min: 0 },
//     cleanSheets: { type: Number, default: 0, min: 0 },
//     points: { type: Number, default: 0, min: 0 }
// }, { _id: false });

const SeasonSchema = new mongoose.Schema({
    years: {
        type: String,
        required: true,
        match: /^\d{4}-\d{4}$/,
        validate: {
            validator: function(value) {
                const [startYear, endYear] = value.split('-').map(Number);
                return endYear === startYear + 1;
            },
            message: 'Invalid season format'
        },
        unique: true
    },
    // statistics: StatisticsSchema,
    trophies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trophy'
    }],
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager',
        required: true
    },
    // topScorer: {
    //     player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    //     goals: { type: Number, min: 0 }
    // },
    // topAssister: {
    //     player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    //     assists: { type: Number, min: 0 }
    // },
    status: {
        type: String,
        enum: ['UPCOMING', 'IN_PROGRESS', 'FINISHED'],
        default: 'UPCOMING',
        required: true
    }
}, {
    timestamps: true,
});

export const Season = mongoose.model('Season', SeasonSchema);