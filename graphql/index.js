import {readFileSync} from "fs";
import { ApolloServer } from 'apollo-server-express';
import { resolvers } from './resolvers.js';
import { expressMiddleware } from '@apollo/server/express4';
// const typeDefs = readFileSync("./graphql/schema.graphql", {encoding:"utf-8"});

// const server = new ApolloServer({
//     typeDefs,
//     resolvers
// });
// app.use('/graphql', expressMiddleware(server));
// app.listen({port: 8989}, () => {
//     console.log('Server started on port 8989');
//     // console.log(`GraphQL playground available at http://localhost:8989/graphql`);
//     console.log('Swagger UI available at http://localhost:8989/api-docs');
// });