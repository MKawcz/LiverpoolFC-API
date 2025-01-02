import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Liverpool FC API',
            version: '1.0.0',
            description: 'REST API for Liverpool FC data management',
        },
        servers: [
            {
                url: 'http://localhost:8989/api/v1',
            },
        ],
    },
    apis: ['./routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);