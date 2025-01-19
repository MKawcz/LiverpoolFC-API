import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Funkcja do wczytywania plików .graphql
const loadGraphQLFile = (filename) => {
    return readFileSync(join(__dirname, filename), 'utf-8');
};

const typeDefs = `
    ${loadGraphQLFile('common.graphql')}
    ${loadGraphQLFile('match.graphql')}
    ${loadGraphQLFile('player.graphql')}
    ${loadGraphQLFile('playerStats.graphql')}
    ${loadGraphQLFile('contract.graphql')}
    ${loadGraphQLFile('season.graphql')}
    ${loadGraphQLFile('competition.graphql')}
    ${loadGraphQLFile('manager.graphql')}
    ${loadGraphQLFile('stadium.graphql')} 
    ${loadGraphQLFile('trophy.graphql')}     
`;

export default typeDefs;