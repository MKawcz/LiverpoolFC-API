import mongoose from 'mongoose';

const StadiumSchema = new mongoose.Schema({
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    location: { type: String, required: true },
});

export const Stadium = mongoose.model('Stadium', StadiumSchema);