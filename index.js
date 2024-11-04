import express from 'express';
import connectDB from './config/db.js'
import cors from 'cors';
import { playersRouter } from './routes/playersRoute.js';
import { matchesRouter } from './routes/matchesRoute.js';
import { trophiesRouter } from './routes/trophiesRoute.js';

const app = express();

app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

connectDB();

app.use((req, res, next) => {
    if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/json');
    }
    next();
});


app.use('/api/v1/players', playersRouter);
app.use('/api/v1/matches', matchesRouter);
app.use('/api/v1/trophies', trophiesRouter);

app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

app.listen(8989, () => {
    console.log('Server started on port 8989');
});