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
    timestamps: true,
    _id: false
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
}, { _id: false });

const LineupSchema = new mongoose.Schema({
    starting: {
        type: [{
            player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
        }]
    },
    substitutes: [{
        player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true }
    }],
    substitutions: [SubstitutionSchema]
}, { _id: false });

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
                const startDate = new Date(value);
                const currentDate = new Date();
                const minDate = new Date('2000-01-01');
                const maxDate = new Date(currentDate.getFullYear(), 11, 31);

                return startDate >= minDate && startDate <= maxDate;
            },
            message: 'Start date must be between year 2000 and end of current year'
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
        type: LineupSchema
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
