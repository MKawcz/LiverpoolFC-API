import swaggerJsdoc from 'swagger-jsdoc';
import {fileURLToPath} from "url";
import { dirname, join } from 'path';
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
    definition: {
        openapi: '3.0.0',

        info: {
            title: 'Liverpool FC API',
            version: '1.0.0',
            description: 'REST API for managing Liverpool Football Club data including players, matches, and more',
        },

        servers: [
            {
                url: 'http://localhost:8989/api/v1',
            }
        ],
    },

    apis: [
        join(__dirname, '../routes/*.js')
    ]
};

export const swaggerSpec = swaggerJsdoc(options);

try {
    fs.writeFileSync(
        join(__dirname, 'openapi.json'),
        JSON.stringify(swaggerSpec, null, 2)
    );

    console.log('OpenAPI specification files generated successfully!');
} catch (error) {
    console.error('Error generating OpenAPI specification:', error);
}

