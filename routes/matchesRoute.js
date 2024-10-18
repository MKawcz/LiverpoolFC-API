import express from 'express';
import { matches, players } from '../data.js';

export const matchesRouter = express.Router();

matchesRouter.get('/', (req, res) => {
    res.json(matches);
});

matchesRouter.get('/:matchId/scorers', (req, res) => {
    const match = matches.find((m) => m.id === parseInt(req.params.matchId));
    
    if (!match) {
      return res.status(404).send({ message: 'Match not found' });
    }
  
    const scorers = match.result.goals.map((goal) =>
      players.find((player) => player.id === goal.playerId)
    );
  
    res.send(scorers);
});
  
matchesRouter.get('/:matchId/scorer/:playerId', (req, res) => {
    const match = matches.find((m) => m.id === parseInt(req.params.matchId));
    if (!match) {
        return res.status(404).send({ message: 'Match not found' });
    }

    const player = players.find((p) => p.id === parseInt(req.params.playerId));
    if (!player) {
        return res.status(404).send({ message: 'Player not found' });
    }

    res.send({ matchId: match.id, scorer: player });
});