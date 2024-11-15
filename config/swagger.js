import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
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
};

const options = {
    swaggerDefinition,
    apis: ['./routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
