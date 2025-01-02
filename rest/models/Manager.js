import mongoose from 'mongoose';

const ManagerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
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
                return age >= 18 && age <= 100;
            },
            message: 'Manager must be between 18 and 100 years old'
        }
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
        default: 'ACTIVE'
    }
}, {
    timestamps: true
});

export const Manager = mongoose.model('Manager', ManagerSchema);
