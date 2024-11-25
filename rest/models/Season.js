import mongoose from "mongoose";

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
            message: props => `${props.value} is not a valid season. Use format "YYYY-YYYY", where second year is one more than first.`,
        },
    },
    matchesWon: { type: Number, required: true, min: 0 },
    matchesLost: { type: Number, required: true, min: 0 },
    matchesDrawn: { type: Number, required: true, min: 0 },
    topScorer: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' }
});

export const Season = mongoose.model('Season', SeasonSchema);