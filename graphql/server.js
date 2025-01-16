import { ApolloServer } from 'apollo-server';
import connectDB from '../rest/config/db.js'
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Importy schemy i resolverów
import resolvers from './resolvers/index.js';
import typeDefs from './schema/index.js';

// Połączenie z bazą danych
connectDB();

// Konfiguracja serwera Apollo
const server = new ApolloServer({
    typeDefs,
    resolvers,
    playground: true, // Włączamy playground
    introspection: true,
    formatError: (error) => {
        console.error(error);
        return {
            message: error.message,
            locations: error.locations,
            path: error.path
        };
    }
});

// Uruchomienie serwera
server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});