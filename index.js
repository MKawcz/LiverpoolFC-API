import express from 'express';
import { playersRouter } from './routes/playersRoute.js';
import { matchesRouter } from './routes/matchesRoute.js';
import { trophiesRouter } from './routes/trophiesRoute.js';

const app = express();
app.use(express.json());

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//     next();
// });
//sprawdz czy headery git bo mozliwe ze mozna bez 'Access-Control-Allow-Headers' i samo set zamiast setHeader
// jezeli content type jest inny niz ten co ustawisz to powinnismy zwracac 405

app.use((req, res, next) => {
    const ct = res.setHeader('Content-Type');
    if(ct !== 'application/json') {
        res.status(400);
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