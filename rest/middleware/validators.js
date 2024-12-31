import mongoose from 'mongoose';

// Walidacja ID MongoDB z parametryzowaną nazwą parametru
export const validateObjectId = (paramName) => (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
        return res.status(400).json({
            error: 'Invalid ID Format',
            message: `The provided ${paramName} is not a valid MongoDB ObjectId`,
            _links: { collection: req.baseUrl }
        });
    }
    next();
};

// Walidacja czy przesłane pola są dozwolone
export const validateAllowedFields = (allowedFields) => (req, res, next) => {
    const receivedFields = Object.keys(req.body);
    const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
        return res.status(400).json({
            error: 'Invalid fields',
            message: `Fields not allowed: ${invalidFields.join(', ')}`,
            allowedFields,
            _links: { collection: req.baseUrl }
        });
    }
    next();
};