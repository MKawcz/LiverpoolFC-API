import express from 'express';
import connectDB from './config/db.js'
import cors from 'cors';
import { swaggerSpec } from './config/swagger.js';
import swaggerUi from 'swagger-ui-express';
import { addCustomHeaders } from './middleware/headers.js';

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

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8989'
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
        'Content-Type',
        'Accept',
        'If-Modified-Since'
    ],
    exposedHeaders: [
        'X-Total-Count',
        'X-Resource-Type',
        'X-Resource-Id',
        'Location',
        'Last-Modified',
        'X-Deleted-At',
        'X-Request-ID'
    ],
    maxAge: 86400
}));

app.use(express.json());
app.use(addCustomHeaders);

connectDB();

app.get('/api/v1', (req, res) => {
    res.json({
        message: 'Welcome to Liverpool FC API',
        _links: {
            players: { href: '/api/v1/players' },
            matches: { href: '/api/v1/matches' },
            seasons: { href: '/api/v1/seasons' },
            trophies: { href: '/api/v1/trophies' },
            stadiums: { href: '/api/v1/stadiums' },
            managers: { href: '/api/v1/managers' },
            competitions: { href: '/api/v1/competitions' },
            contracts: { href: '/api/v1/contracts' },
            playerStats: { href: '/api/v1/player-stats' },
            documentation: { href: '/api-docs' }
        }
    });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1/players', playersRouter);
app.use('/api/v1/matches', matchesRouter);
app.use('/api/v1/trophies', trophiesRouter);
app.use('/api/v1/stadiums', stadiumsRouter);
app.use('/api/v1/managers', managersRouter);
app.use('/api/v1/player-stats', playerStatsRouter);
app.use('/api/v1/seasons', seasonRouter);
app.use('/api/v1/competitions', competitionRouter);
app.use('/api/v1/contracts', contractRouter);

app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist',
        _links: {
            home: { href: '/api/v1' },
            documentation: { href: '/api-docs' }
        }
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        _links: {
            home: { href: '/api/v1' }
        }
    });
});

const PORT = process.env.PORT || 8989;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});