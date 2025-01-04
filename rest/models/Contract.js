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
                const startDate = new Date(value);
                const currentDate = new Date();
                const minDate = new Date('2000-01-01');
                const maxDate = new Date(currentDate.getFullYear(), 11, 31);

                return startDate >= minDate && startDate <= maxDate;
            },
            message: 'Start date must be between year 2000 and end of current year'
        }
    },
    end: {
        type: Date,
        required: true,
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

ContractSchema.pre('validate', function(next) {
    if (this.start && this.end && this.end <= this.start) {
        this.invalidate('end', 'End date must be after start date');
    }
    next();
});

export const Contract = mongoose.model('Contract', ContractSchema);