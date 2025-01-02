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
            message: 'Invalid season format'
        },
        unique: true
    },
    trophies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trophy'
    }],
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager',
        required: true
    },
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