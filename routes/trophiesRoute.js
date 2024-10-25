import express from 'express';
import { trophies, seasons } from '../data.js';

export const trophiesRouter = express.Router();

trophiesRouter.get('/', (req, res) => {
  res.json(trophies);
});

trophiesRouter.post('/', (req, res) => {
  const newTrophy = { ...req.body, id: trophies.length + 1 };
  trophies.push(newTrophy);
  res.status(201).json(newTrophy);
});

trophiesRouter.route('/:trophyId')
  .get((req, res) => {
    const trophy = trophies.find(t => t.id === parseInt(req.params.trophyId));
    if (trophy) res.json(trophy);
    else res.status(404).json({ message: 'Trophy not found' });
  })
  .put((req, res) => {
    const trophyIndex = trophies.findIndex(t => t.id === parseInt(req.params.trophyId));
    if (trophyIndex !== -1) {
      trophies[trophyIndex] = { ...trophies[trophyIndex], ...req.body };
      res.json(trophies[trophyIndex]);
    } else {
      res.status(404).json({ message: 'Trophy not found' });
    }
  })
  .patch((req, res) => {
    const trophy = trophies.find(t => t.id === parseInt(req.params.trophyId));
    if (trophy) {
      Object.assign(trophy, req.body);
      res.json(trophy);
    } else {
      res.status(404).json({ message: 'Trophy not found' });
    }
  })
  .delete((req, res) => {
    const trophyIndex = trophies.findIndex(t => t.id === parseInt(req.params.trophyId));
    if (trophyIndex !== -1) {
      trophies.splice(trophyIndex, 1);
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Trophy not found' });
    }
  });

trophiesRouter.route('/:trophyId/seasons')
  .get((req, res) => {
    const trophySeasons = seasons.filter(s => s.trophyId === parseInt(req.params.trophyId));
    if (trophySeasons.length > 0) res.json(trophySeasons);
    else res.status(404).json({ message: 'No seasons found for this trophy' });
  })
  .post((req, res) => {
    const newSeason = { ...req.body, trophyId: parseInt(req.params.trophyId), id: seasons.length + 1 };
    seasons.push(newSeason);
    res.status(201).json(newSeason);
  })
  .put((req, res) => {
    const seasonIndex = seasons.findIndex(s => s.id === parseInt(req.body.id) && s.trophyId === parseInt(req.params.trophyId));
    if (seasonIndex !== -1) {
      seasons[seasonIndex] = { ...seasons[seasonIndex], ...req.body };
      res.json(seasons[seasonIndex]);
    } else {
      res.status(404).json({ message: 'Season not found' });
    }
  })
  .patch((req, res) => {
    const season = seasons.find(s => s.id === parseInt(req.body.id) && s.trophyId === parseInt(req.params.trophyId));
    if (season) {
      Object.assign(season, req.body);
      res.json(season);
    } else {
      res.status(404).json({ message: 'Season not found' });
    }
  })
  .delete((req, res) => {
    const seasonIndex = seasons.findIndex(s => s.id === parseInt(req.body.id) && s.trophyId === parseInt(req.params.trophyId));
    if (seasonIndex !== -1) {
      seasons.splice(seasonIndex, 1);
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Season not found' });
    }
  });
