import mongoose from 'mongoose';

const MODEL_REFERENCES = {
    Match: {
        season: 'Season',
        competition: 'Competition',
        stadium: 'Stadium',
        'lineup.starting.*.player': 'Player',
        'lineup.substitutes.*.player': 'Player',
        'lineup.substitutions.*.playerIn': 'Player',
        'lineup.substitutions.*.playerOut': 'Player',
        'goals.*.scorer': 'Player',
        'goals.*.assistant': { model: 'Player', optional: true }
    },
    Season: {
        manager: 'Manager',
        trophies: ['Trophy'],
        'topScorer.player': { model: 'Player', optional: true },
        'topAssister.player': { model: 'Player', optional: true }
    },
    Player: {
        currentContract: { model: 'Contract', optional: true },
        stats: { model: 'PlayerStats', optional: true },
        contractsHistory: ['Contract']
    },
    Trophy: {
        competition: 'Competition'
    }
};

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

// Pomocnicza funkcja do pobierania wartości z zagnieżdżonej ścieżki
const getValueByPath = (obj, path) => {
    if (path.includes('*')) {
        const [arrayPath, ...rest] = path.split('.*.');
        const array = arrayPath.split('.').reduce((o, i) => o?.[i], obj);
        if (!Array.isArray(array)) return [];
        return array.map(item => rest.join('.').split('.').reduce((o, i) => o?.[i], item)).filter(Boolean);
    }
    return [path.split('.').reduce((o, i) => o?.[i], obj)].filter(Boolean);
};

// Główna funkcja walidacyjna
export const createReferenceValidator = (modelName) => async (req, res, next) => {
    try {
        const references = MODEL_REFERENCES[modelName];
        if (!references) return next();

        for (const [path, refInfo] of Object.entries(references)) {
            const isArray = Array.isArray(refInfo);
            const modelName = isArray ? refInfo[0] : (typeof refInfo === 'string' ? refInfo : refInfo.model);
            const isOptional = !isArray && typeof refInfo === 'object' && refInfo.optional;

            const values = getValueByPath(req.body, path);

            if (values.length > 0) {
                const ids = isArray ? values : values;
                const count = await mongoose.model(modelName).countDocuments({
                    _id: { $in: ids }
                });

                if (count !== ids.length) {
                    return res.status(400).json({
                        error: 'Invalid Reference',
                        message: `Invalid ${modelName} reference in ${path}`,
                        _links: { collection: req.baseUrl }
                    });
                }
            } else if (!isOptional && req.method === 'POST' && !path.includes('*')) {
                return res.status(400).json({
                    error: 'Missing Reference',
                    message: `Required field ${path} is missing`,
                    _links: { collection: req.baseUrl }
                });
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};
