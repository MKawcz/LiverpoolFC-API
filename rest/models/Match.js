import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
    scorer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    assistant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    minute: {
        type: Number,
        required: true,
        min: 1,
        max: 120
    },
    description: { type: String }
}, {
    timestamps: true
});

const SubstitutionSchema = new mongoose.Schema({
    playerIn: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    playerOut: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    minute: {
        type: Number,
        required: true,
        min: 1,
        max: 120
    }
});

const LineupSchema = new mongoose.Schema({
    starting: {
        type: [{
            player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
        }],
        validate: {
            validator: function(v) {
                return v.length === 11;
            },
            message: 'Starting lineup must have exactly 11 players'
        }
    },
    substitutes: [{
        player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true }
    }],
    substitutions: [SubstitutionSchema]
});

const MatchSchema = new mongoose.Schema({
    season: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Season',
        required: true
    },
    competition: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Competition',
        required: true
    },
    date: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value <= new Date();
            },
            message: 'Match date cannot be in the future'
        }
    },
    stadium: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stadium',
        required: true
    },
    opponent: {
        name: { type: String, required: true },
        manager: { type: String }
    },
    score: {
        home: { type: Number, min: 0, default: 0 },
        away: { type: Number, min: 0, default: 0 }
    },
    lineup: {
        type: LineupSchema,
        required: true
    },
    goals: [GoalSchema],
    referee: {
        main: { type: String, required: true },
        assistants: [{ type: String }],
        fourth: { type: String }
    },
}, {
    timestamps: true,
});

export const Match = mongoose.model('Match', MatchSchema);
