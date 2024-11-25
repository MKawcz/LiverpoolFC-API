import mongoose from "mongoose";

const CompetitionSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    yearOfCreation: {
        type: Number,
        required: true,
        min: 1800,
        validate: {
            validator: function(value) {
                const currentYear = new Date().getFullYear();
                return value <= currentYear;
            },
            message: props => `${props.value} is not a valid year. Must be less than or equal to the current year.`,
        },
    },
    bonusForWinning: { type: Number, required: true, min: 0 },
});

export const Competition = mongoose.model('Competition', CompetitionSchema);
