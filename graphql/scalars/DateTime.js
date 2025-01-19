import { GraphQLScalarType, Kind } from 'graphql';

export const DateTime = new GraphQLScalarType({
    name: 'DateTime',
    description: 'Date time scalar in ISO 8601 format',

    serialize(value) {
        if (!value) return null;

        if (value instanceof Date) {
            if (isNaN(value.getTime())) {
                throw new Error('Invalid Date object');
            }
            return value.toISOString();
        }

        if (typeof value === 'string') {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date string');
            }
            return date.toISOString();
        }

        throw new Error('DateTime can only serialize Date objects or date strings');
    },

    parseValue(value) {
        if (!value) return null;

        if (typeof value !== 'string') {
            throw new Error('DateTime must be a string');
        }

        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date string');
        }
        return date;
    },

    parseLiteral(ast) {
        if (ast.kind !== Kind.STRING) return null;

        const date = new Date(ast.value);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date string');
        }
        return date;
    }
});