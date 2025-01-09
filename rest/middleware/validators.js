import mongoose from 'mongoose';
import get from 'lodash/get.js';

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

export const validateAllowedFields = (allowedFields) => (req, res, next) => {
    let invalidFields;
    if (Array.isArray(req.body)) {
      invalidFields = req.body
            .flatMap(item => Object.keys(item))
            .filter(field => !allowedFields.includes(field));
    } else {
        const receivedFields = Object.keys(req.body);
        invalidFields = receivedFields.filter(field => !allowedFields.includes(field));
    }
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

export const validateReferences = (validations) => async (req, res, next) => {
    try {
        const formatErrors = [];
        const notFoundErrors = [];

        for (const [path, modelName] of Object.entries(validations)) {
            const value = Array.isArray(req.body)
                ? req.body.map(item => get(item, path))
                : get(req.body, path);

            if (!value) continue;

            const ids = Array.isArray(value)
                ? value.filter(Boolean)
                : [value];

            if (ids.length === 0) continue;

            const invalidFormatIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
            if (invalidFormatIds.length > 0) {
                formatErrors.push(`Invalid ID format in ${path}: ${invalidFormatIds.join(', ')}`);
                continue;
            }

            const Model = mongoose.model(modelName);
            const existingDocs = await Model.find({ _id: { $in: ids } }, '_id');
            const existingIds = existingDocs.map(doc => doc._id.toString());

            const missingIds = ids.filter(id => !existingIds.includes(id.toString()));
            if (missingIds.length > 0) {
                notFoundErrors.push(`${modelName}(s) not found in ${path}: ${missingIds.join(', ')}`);
            }
        }

        if (formatErrors.length > 0) {
            return res.status(400).json({
                error: 'Invalid ID Format',
                message: formatErrors.join('. '),
                _links: { collection: req.baseUrl }
            });
        }

        if (notFoundErrors.length > 0) {
            return res.status(404).json({
                error: 'References Not Found',
                message: notFoundErrors.join('. '),
                _links: { collection: req.baseUrl }
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { collection: req.baseUrl }
        });
    }
};