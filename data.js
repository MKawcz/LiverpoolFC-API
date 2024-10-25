export const players = [
  {
    id: 1,
    name: "Mohamed Salah",
    position: "Forward",
    nationality: "Egypt",
  },
];

export const playerStats = [
  {
    id: 1,
    playerId: 1,
    appearances: 300,
    goals: 180,
    assists: 75,
    yellowCards: 10,
    redCards: 1,
  },
];

export const contracts = [
  {
    id: 1,
    playerId: 1,
    start: "2017-07-01",
    end: "2025-06-30",
    salary: 200000,
    bonuses: {
      goal: 5000,
      assist: 2000,
    },
  },
];

export const matches = [
  {
    id: 1,
    date: "2024-10-01",
    opponent: "Manchester United",
    score: "3-1",
    stadium: {
      name: "Anfield",
      capacity: 54000,
      location: "Liverpool, UK",
    },
  },
];

export const goals = [
  { id: 1, matchId: 1, playerId: 1, minute: 23 },
  { id: 2, matchId: 1, playerId: 4, minute: 57 },
  { id: 3, matchId: 1, playerId: 1, minute: 78 },
];

export const lineups = [
  { id: 1, matchId: 1, starting: [1, 2, 3], substitutes: [5, 6] },
];

export const trophies = [
  {
    id: 1,
    name: "Premier League",
    topScorerId: 1,
    finalsWon: 2,
  },
];

export const seasons = [
  { id: 1, trophyId: 1, year: 2019 },
  { id: 2, trophyId: 1, year: 2020 },
];
