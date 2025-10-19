import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

const loadSwaggerDocs = () => {
    const basePath = path.resolve('docs/swagger'); // Carpeta donde guardas los módulos
    const files = ['auth.json', 'chat.json', 'practice.json', 'dashboard.json'];

    const mergedPaths = files.reduce((acc, file) => {
        const content = JSON.parse(fs.readFileSync(path.join(basePath, file), 'utf-8'));
        return { ...acc, ...content.paths };
    }, {});

    return {
        openapi: '3.0.0',
        info: {
            title: 'API Chat Idiomas',
            version: '1.0.0',
            description: 'Documentación Swagger segmentada por módulos'
        },
        servers: [{ url: 'http://localhost:5000/api/chat' }],
        paths: mergedPaths,
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }]
    };
};

export default loadSwaggerDocs;
