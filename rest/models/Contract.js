import mongoose from "mongoose";

const BonusSchema = new mongoose.Schema({
    goal: { type: Number, required: true, min: 0 },
    assist: { type: Number, required: true, min: 0 },
    cleanSheet: { type: Number, required: true, min: 0 },
}, { _id: false });

const ContractSchema = new mongoose.Schema({
    start: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value <= new Date();
            },
            message: props => `Start date (${props.value}) cannot be in the future.`,
        },
    },
    end: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value > this.start;
            },
            message: `End date must be after start date.`,
        },
    },
    salary: { type: Number, required: true, min: 0 },
    bonuses: BonusSchema,
    seasons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Season' }],
});

export const Contract = mongoose.model('Contract', ContractSchema);