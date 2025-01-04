import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
    name: {
        first: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
        last: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
        displayName: { type: String, trim: true, maxlength: 100 }
    },
    position: {
        type: String,
        required: true,
        enum: ['GK', 'DEF', 'MID', 'FWD']
    },
    nationality: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    dateOfBirth: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                const age = (new Date().getFullYear() - value.getFullYear());
                return age >= 15 && age <= 45;
            },
            message: 'Player must be between 15 and 45 years old'
        }
    },
    height: { type: Number, min: 150, max: 220 },
    weight: { type: Number, min: 50, max: 120 },
    status: {
        type: String,
        enum: ['ACTIVE', 'INJURED', 'SUSPENDED', 'ON_LOAN', 'INACTIVE'],
        default: 'ACTIVE'
    },
    jerseyNumber: {
        type: Number,
        min: 1,
        max: 99,
        unique: true
    },
    currentContract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract'
    },
    stats: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PlayerStats'
    },
    marketValue: {
        value: { type: Number, required: true, min: 0 },
        currency: { type: String, required: true, enum: ['EUR', 'GBP', 'USD'] },
        date: { type: Date, required: true, default: Date.now }
    },
}, {
    timestamps: true,
});

export const Player = mongoose.model('Player', PlayerSchema);
