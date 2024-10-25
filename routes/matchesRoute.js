import express from 'express';
import { matches, goals, lineups } from '../data.js';

export const matchesRouter = express.Router();

matchesRouter.get('/', (req, res) => {
  res.json(matches);
});

matchesRouter.post('/', (req, res) => {
  const newMatch = { ...req.body, id: matches.length + 1 };
  matches.push(newMatch);
  res.status(201).json(newMatch);
});

matchesRouter.route('/:matchId')
  .get((req, res) => {
    const match = matches.find(m => m.id === parseInt(req.params.matchId));
    if (match) res.json(match);
    else res.status(404).json({ message: 'Match not found' });
  })
  .put((req, res) => {
    const matchIndex = matches.findIndex(m => m.id === parseInt(req.params.matchId));
    if (matchIndex !== -1) {
      matches[matchIndex] = { ...matches[matchIndex], ...req.body };
      res.json(matches[matchIndex]);
    } else {
      res.status(404).json({ message: 'Match not found' });
    }
  })
  .patch((req, res) => {
    const match = matches.find(m => m.id === parseInt(req.params.matchId));
    if (match) {
      Object.assign(match, req.body);
      res.json(match);
    } else {
      res.status(404).json({ message: 'Match not found' });
    }
  })
  .delete((req, res) => {
    const matchIndex = matches.findIndex(m => m.id === parseInt(req.params.matchId));
    if (matchIndex !== -1) {
      matches.splice(matchIndex, 1);
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Match not found' });
    }
  });

matchesRouter.route('/:matchId/goals')
  .get((req, res) => {
    const matchGoals = goals.filter(g => g.matchId === parseInt(req.params.matchId));
    if (matchGoals.length > 0) res.json(matchGoals);
    else res.status(404).json({ message: 'No goals found for this match' });
  })
  .post((req, res) => {
    const newGoal = { ...req.body, matchId: parseInt(req.params.matchId), id: goals.length + 1 };
    goals.push(newGoal);
    res.status(201).json(newGoal);
  })
  .put((req, res) => {
    const goalIndex = goals.findIndex(g => g.id === parseInt(req.body.id) && g.matchId === parseInt(req.params.matchId));
    if (goalIndex !== -1) {
      goals[goalIndex] = { ...goals[goalIndex], ...req.body };
      res.json(goals[goalIndex]);
    } else {
      res.status(404).json({ message: 'Goal not found' });
    }
  })
  .patch((req, res) => {
    const goal = goals.find(g => g.id === parseInt(req.body.id) && g.matchId === parseInt(req.params.matchId));
    if (goal) {
      Object.assign(goal, req.body);
      res.json(goal);
    } else {
      res.status(404).json({ message: 'Goal not found' });
    }
  })
  .delete((req, res) => {
    const goalIndex = goals.findIndex(g => g.id === parseInt(req.body.id) && g.matchId === parseInt(req.params.matchId));
    if (goalIndex !== -1) {
      goals.splice(goalIndex, 1);
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Goal not found' });
    }
  });

matchesRouter.route('/:matchId/lineup')
  .get((req, res) => {
    const lineup = lineups.find(l => l.matchId === parseInt(req.params.matchId));
    if (lineup) res.json(lineup);
    else res.status(404).json({ message: 'Lineup not found for this match' });
  })
  .post((req, res) => {
    const newLineup = { ...req.body, matchId: parseInt(req.params.matchId), id: lineups.length + 1 };
    lineups.push(newLineup);
    res.status(201).json(newLineup);
  })
  .put((req, res) => {
    const lineupIndex = lineups.findIndex(l => l.matchId === parseInt(req.params.matchId));
    if (lineupIndex !== -1) {
      lineups[lineupIndex] = { ...lineups[lineupIndex], ...req.body };
      res.json(lineups[lineupIndex]);
    } else {
      res.status(404).json({ message: 'Lineup not found for this match' });
    }
  })
  .patch((req, res) => {
    const lineup = lineups.find(l => l.matchId === parseInt(req.params.matchId));
    if (lineup) {
      Object.assign(lineup, req.body);
      res.json(lineup);
    } else {
      res.status(404).json({ message: 'Lineup not found for this match' });
    }
  })
  .delete((req, res) => {
    const lineupIndex = lineups.findIndex(l => l.matchId === parseInt(req.params.matchId));
    if (lineupIndex !== -1) {
      lineups.splice(lineupIndex, 1);
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Lineup not found for this match' });
    }
  });
