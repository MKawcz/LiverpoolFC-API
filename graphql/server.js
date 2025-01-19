import { ApolloServer } from 'apollo-server';
import connectDB from '../rest/config/db.js'

import resolvers from './resolvers/index.js';
import typeDefs from './schema/index.js';

connectDB();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    playground: true, // wlaczamy playground
    formatError: (error) => {       // custom funkcja obsługi błędów
        console.error(error);
        return {
            message: error.message,
            locations: error.locations,
            path: error.path
        };
    }
});

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
    console.log('resolvers', resolvers);
});