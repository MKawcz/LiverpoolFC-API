import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
    goalScorer: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    assistant: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    isPenalty:{  type: Boolean, default: false, required: true },
    minute: { type: Number, required: true, min: 1, max: 120 }
});

const LineupSchema = new mongoose.Schema({
    starting: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true }],
    substitutes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
}, { _id: false });

const MatchSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value <= new Date();
            },
            message: props => `Match date (${props.value}) cannot be in the future.`,
        },
    },
    opponent: { type: String, required: true, trim: true, minlength: 2, maxlength: 100  },
    score: {
        type: String,
        required: true,
        match: /^\d+-\d+$/,
        message: `Score format should be "X-Y" where X and Y are numbers.`,
    },
    stadium: { type: mongoose.Schema.Types.ObjectId, ref: 'Stadium' },
    goals: [GoalSchema],
    lineup: { type: LineupSchema, required: true },
    season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
    competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true },
});

export const Match = mongoose.model('Match', MatchSchema);
