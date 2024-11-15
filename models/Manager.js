import mongoose from 'mongoose';

const ManagerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    nationality: { type: String, required: true },
    dateOfBirth: { type: Date, required: true }
});

export const Manager = mongoose.model('Manager', ManagerSchema);
