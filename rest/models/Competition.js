import mongoose from "mongoose";

const CompetitionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: ['LEAGUE', 'CUP', 'FRIENDLY'],
        default: 'LEAGUE'
    },
    yearOfCreation: {
        type: Number,
        required: true,
        min: 1800,
        validate: {
            validator: function(value) {
                return value <= new Date().getFullYear();
            },
            message: props => `${props.value} must be less than or equal to current year`
        }
    },
}, {
    timestamps: true
});

export const Competition = mongoose.model('Competition', CompetitionSchema);
