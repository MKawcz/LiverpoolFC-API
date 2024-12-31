import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'LiverpoolFC API',
            version: '1.0.0',
            description: 'API for managing Liverpool FC data, including players, matches, and trophies.',
        },
        servers: [
            {
                url: 'http://localhost:8989',
            },
        ],
    },
    apis: ['../rest/routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
