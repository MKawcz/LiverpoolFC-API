import express from 'express';
import { players, playerStats, contracts } from '../data.js';

export const playersRouter = express.Router();

playersRouter.get('/', (req, res) => {
  res.json(players);
});

playersRouter.post('/', (req, res) => {
  const newPlayer = { ...req.body, id: players.length + 1 };
  players.push(newPlayer);
  res.status(201).json(newPlayer);
});

playersRouter.route('/:playerId')
  .get((req, res) => {
    const player = players.find(p => p.id === parseInt(req.params.playerId));
    if (player) res.json(player);
    else res.status(404).json({ message: 'Player not found' });
  })
  .put((req, res) => {
    const playerIndex = players.findIndex(p => p.id === parseInt(req.params.playerId));
    if (playerIndex !== -1) {
      players[playerIndex] = { ...players[playerIndex], ...req.body };
      res.json(players[playerIndex]);
    } else {
      res.status(404).json({ message: 'Player not found' });
    }
  })
  .patch((req, res) => {
    const player = players.find(p => p.id === parseInt(req.params.playerId));
    if (player) {
      Object.assign(player, req.body);
      res.json(player);
    } else {
      res.status(404).json({ message: 'Player not found' });
    }
  })
  .delete((req, res) => {
    const playerIndex = players.findIndex(p => p.id === parseInt(req.params.playerId));
    if (playerIndex !== -1) {
      players.splice(playerIndex, 1);
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Player not found' });
    }
  });

playersRouter.route('/:playerId/stats')
  .get((req, res) => {
    const stats = playerStats.find(s => s.playerId === parseInt(req.params.playerId));
    if (stats) res.json(stats);
    else res.status(404).json({ message: 'Stats not found for this player' });
  })
  .post((req, res) => {
    const newStats = { ...req.body, playerId: parseInt(req.params.playerId), id: playerStats.length + 1 };
    playerStats.push(newStats);
    res.status(201).json(newStats);
  })
  .put((req, res) => {
    const statsIndex = playerStats.findIndex(s => s.playerId === parseInt(req.params.playerId));
    if (statsIndex !== -1) {
      playerStats[statsIndex] = { ...playerStats[statsIndex], ...req.body };
      res.json(playerStats[statsIndex]);
    } else {
      res.status(404).json({ message: 'Stats not found for this player' });
    }
  })
  .patch((req, res) => {
    const stats = playerStats.find(s => s.playerId === parseInt(req.params.playerId));
    if (stats) {
      Object.assign(stats, req.body);
      res.json(stats);
    } else {
      res.status(404).json({ message: 'Stats not found for this player' });
    }
  })
  .delete((req, res) => {
    const statsIndex = playerStats.findIndex(s => s.playerId === parseInt(req.params.playerId));
    if (statsIndex !== -1) {
      playerStats.splice(statsIndex, 1);
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Stats not found for this player' });
    }
  });

playersRouter.route('/:playerId/contract')
  .get((req, res) => {
    const contract = contracts.find(c => c.playerId === parseInt(req.params.playerId));
    if (contract) res.json(contract);
    else res.status(404).json({ message: 'Contract not found for this player' });
  })
  .post((req, res) => {
    const newContract = { ...req.body, playerId: parseInt(req.params.playerId), id: contracts.length + 1 };
    contracts.push(newContract);
    res.status(201).json(newContract);
  })
  .put((req, res) => {
    const contractIndex = contracts.findIndex(c => c.playerId === parseInt(req.params.playerId));
    if (contractIndex !== -1) {
      contracts[contractIndex] = { ...contracts[contractIndex], ...req.body };
      res.json(contracts[contractIndex]);
    } else {
      res.status(404).json({ message: 'Contract not found for this player' });
    }
  })
  .patch((req, res) => {
    const contract = contracts.find(c => c.playerId === parseInt(req.params.playerId));
    if (contract) {
      Object.assign(contract, req.body);
      res.json(contract);
    } else {
      res.status(404).json({ message: 'Contract not found for this player' });
    }
  })
  .delete((req, res) => {
    const contractIndex = contracts.findIndex(c => c.playerId === parseInt(req.params.playerId));
    if (contractIndex !== -1) {
      contracts.splice(contractIndex, 1);
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Contract not found for this player' });
    }
  });
