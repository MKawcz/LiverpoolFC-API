import express from 'express';
import { players } from '../data.js';

export const playersRouter = express.Router();

playersRouter.get('/', (req, res) => {
    res.send(players);
});
  
playersRouter.get('/:playerId', (req, res) => {
  const player = players.find((p) => p.id === parseInt(req.params.playerId));
  if (player) {
    res.send(player);
  } else {
    res.status(404).send({ message: 'Player not found' });
  }
});