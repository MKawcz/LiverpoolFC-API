import express from 'express';
import connectDB from '../config/db.js'
import cors from 'cors';
import { swaggerSpec } from '../config/swagger.js';
import swaggerUi from 'swagger-ui-express';

import { playersRouter } from './routes/playersRoute.js';
import { matchesRouter } from './routes/matchesRoute.js';
import { trophiesRouter } from './routes/trophiesRoute.js';
import { stadiumsRouter } from './routes/stadiumRoute.js';
import { managersRouter } from './routes/managerRoute.js';
import { playerStatsRouter } from './routes/playerStatsRoute.js';
import { seasonRouter } from './routes/seasonRoute.js';
import { competitionRouter } from './routes/competitionRoute.js';
import { contractRouter } from './routes/contractRoute.js';

const app = express();

app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
        'Content-Type',       // Typ danych (np. application/json)
        'Accept',             // Określa preferowany format odpowiedzi
        'X-Request-ID',       // Identyfikator żądania do logowania/debugowania
        'Cache-Control',      // Kontrola cache'owania odpowiedzi
        'User-Agent',         // Informacje o kliencie wykonującym żądanie
    ],
}));

connectDB();

app.use((req, res, next) => {
    if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/json');
    }
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; object-src 'none';");
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'LiverpoolFC-API');

    next();
});

await server.start();
server.applyMiddleware({ app });

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1/players', playersRouter);
app.use('/api/v1/matches', matchesRouter);
app.use('/api/v1/trophies', trophiesRouter);
app.use('/api/v1/stadiums', stadiumsRouter);
app.use('/api/v1/managers', managersRouter);
app.use('/api/v1/player-stats', playerStatsRouter);
app.use('/api/v1/season', seasonRouter);
app.use('/api/v1/competition', competitionRouter);
app.use('/api/v1/contract', contractRouter);

app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

app.listen({port: 8989}, () => {
    console.log('Server started on port 8989');
    console.log('Swagger UI available at http://localhost:8989/api-docs');
});