import mongoose from 'mongoose';

const StadiumSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    capacity: { type: Number, required: true, min: 100 },
    location: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
});

export const Stadium = mongoose.model('Stadium', StadiumSchema);