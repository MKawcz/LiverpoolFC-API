import { GraphQLScalarType, Kind } from 'graphql';

export const DateTime = new GraphQLScalarType({
    name: 'DateTime',
    description: 'Own typ to manage date in ISO 8601 format',

    // Serializacja (z wartości w bazie do JSON)
    serialize(value) {
        return value instanceof Date ? value.toISOString() : null;
    },

    // Parsowanie wartości z zapytania
    parseValue(value) {
        return new Date(value);
    },

    // Parsowanie wartości z literału w zapytaniu GraphQL
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
            return new Date(ast.value);
        }
        return null;
    }
});

