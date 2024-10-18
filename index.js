import express from 'express';
import {playersRouter} from './routes/playersRoute.js'
import {matchesRouter} from './routes/matchesRoute.js'
import {trophiesRouter} from './routes/trophiesRoute.js'
const app = new express();

app.use('/players', playersRouter);
app.use('/matches', matchesRouter);
app.use('/trophies', trophiesRouter);

app.listen(8989, () => {
    console.log('started on 8989');
});