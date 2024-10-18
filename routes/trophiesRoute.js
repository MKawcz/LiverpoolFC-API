import express from 'express';
import { trophies, players } from '../data.js';

export const trophiesRouter = express.Router();

trophiesRouter.get('/', (req, res) => {
    res.send(trophies);
});
  
trophiesRouter.get('/:trophieId/topscorer', (req, res) => {
    const trophy = trophies.find((t) => t.id === parseInt(req.params.id));
    if (!trophy) {
        return res.status(404).send({ message: 'Trophy not found' });
    }

    const topScorer = players.find((p) => p.id === trophy.topScorer.playerId);
    if (!topScorer) {
        return res.status(404).send({ message: 'Top scorer not found' });
    }

    res.send({ trophy: trophy.name, topScorer });
});