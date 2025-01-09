import { BusinessLogicError } from '../errors/BusinessLogicError.js';
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
    home: { type: String},
}, {
    timestamps: true,
});

MatchSchema.pre('validate', function(next) {
    this._allLineupPlayerIds = [
        ...this.lineup.starting.map(p => p.player.toString()),
        ...this.lineup.substitutes.map(p => p.player.toString())
    ];
    next();
});

MatchSchema.pre('save', async function(next) {
    const season = await mongoose.model('Season').findById(this.season);
    if (!season) {
        throw new BusinessLogicError('Season not found');
    }

    const matchYear = this.date.getFullYear();

    const [startYear, endYear] = season.years.split('-').map(Number);

    if (matchYear < startYear || matchYear > endYear) {
        throw new BusinessLogicError('Match date must be within season years');
    }

    next();
});

MatchSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();

    if (update.$set?.date || update.date) {
        const match = await this.model.findOne(this.getQuery());
        const season = await mongoose.model('Season').findById(match.season);

        if (!season) {
            throw new BusinessLogicError('Season not found');
        }

        const matchYear = new Date(update.$set?.date || update.date).getFullYear();
        const [startYear, endYear] = season.years.split('-').map(Number);

        if (matchYear < startYear || matchYear > endYear) {
            throw new BusinessLogicError('Match date must be within season years');
        }
    }

    next();
});

MatchSchema.pre('save', async function(next) {
    const allPlayerIds = this._allLineupPlayerIds;

    const uniquePlayerIds = new Set(allPlayerIds);
    if (uniquePlayerIds.size !== allPlayerIds.length) {
        throw new BusinessLogicError('Players cannot be duplicated in lineup');
    }

    const players = await mongoose.model('Player').find({
        '_id': { $in: allPlayerIds }
    });

    const inactivePlayer = players.find(p => p.status !== 'ACTIVE');
    if (inactivePlayer) {
        throw new BusinessLogicError(`Player ${inactivePlayer.name.first} ${inactivePlayer.name.last} is not active`);
    }

    next();
});

MatchSchema.pre('save', async function(next) {
    if (!this.goals || this.goals.length === 0) {
        return next();
    }

    const allLineupPlayerIds = this._allLineupPlayerIds;

    const invalidScorer = this.goals.find(goal =>
        !allLineupPlayerIds.includes(goal.scorer.toString())
    );

    if (invalidScorer) {
        throw new BusinessLogicError('Goal scorer must be in match lineup');
    }

    const invalidAssistant = this.goals.find(goal =>
        goal.assistant && !allLineupPlayerIds.includes(goal.assistant.toString())
    );

    if (invalidAssistant) {
        throw new BusinessLogicError('Goal assistant must be in match lineup');
    }

    next();
});

MatchSchema.pre('save', async function(next) {
    if (!this.lineup.substitutions || this.lineup.substitutions.length === 0) {
        return next();
    }

    const allLineupPlayerIds = this._allLineupPlayerIds;

    const invalidSubstitution = this.lineup.substitutions.find(sub =>
        !allLineupPlayerIds.includes(sub.playerIn.toString()) ||
        !allLineupPlayerIds.includes(sub.playerOut.toString())
    );

    if (invalidSubstitution) {
        throw new BusinessLogicError('Substitution players must be in match lineup');
    }

    next();
});

MatchSchema.pre('save', function(next) {
    const ourGoals = this.goals ? this.goals.length : 0;

    if (this.home) {
        this.score.home = ourGoals;
    } else {
        this.score.away = ourGoals;
    }

    if (this._allLineupPlayerIds) {
        delete this._allLineupPlayerIds;
    }

    next();
});

export const Match = mongoose.model('Match', MatchSchema);
