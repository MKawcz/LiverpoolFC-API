export const validatePostPut = (requiredFields) => (req, res, next) => {
    const missingFields = requiredFields.filter(field => !(field in req.body));
    if (missingFields.length > 0) {
        return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const invalidFields = Object.keys(req.body).filter(field => !requiredFields.includes(field));
    if (invalidFields.length > 0) {
        return res.status(400).json({ message: `Invalid fields: ${invalidFields.join(', ')}` });
    }

    next();
};

export const validatePatch = (allowedFields) => (req, res, next) => {
    const invalidFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
        return res.status(400).json({ message: `Invalid fields: ${invalidFields.join(', ')}` });
    }

    next();
};