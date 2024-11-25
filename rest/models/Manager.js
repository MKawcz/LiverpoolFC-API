import mongoose from 'mongoose';

const ManagerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100  },
    nationality: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    dateOfBirth: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value <= new Date();
            },
            message: props => `Date of birth (${props.value}) cannot be in the future.`,
        },
    },
});

export const Manager = mongoose.model('Manager', ManagerSchema);
