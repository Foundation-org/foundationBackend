const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

// Swagger options
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Foundation API with Swagger',
            version: '1.0.0',
            description: 'Foundation API with Swagger documentation',
        },
        servers: [
            {
                url: 'http://localhost:7354',
            },
        ],
    },
    apis: [path.resolve(__dirname, '../start/routes.js')],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
module.exports = swaggerSpec;