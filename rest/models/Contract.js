import mongoose from "mongoose";

const BonusSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['GOAL', 'ASSIST', 'CLEAN_SHEET', 'APPEARANCE', 'WIN']
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
}, { _id: false });

const ContractSchema = new mongoose.Schema({
    start: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value <= new Date();
            },
            message: 'Start date cannot be in the future'
        }
    },
    end: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value > this.start;
            },
            message: 'End date must be after start date'
        }
    },
    salary: {
        base: { type: Number, required: true, min: 0 },
        currency: {
            type: String,
            required: true,
            enum: ['GBP', 'EUR', 'USD'],
            default: 'GBP'
        }
    },
    bonuses: [BonusSchema],
}, {
    timestamps: true,
});

export const Contract = mongoose.model('Contract', ContractSchema);