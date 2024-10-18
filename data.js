export const players = [
    {
      id: 1,
      name: "Mohamed Salah",
      position: "Forward",
      nationality: "Egypt",
      stats: {
        appearances: 300,
        goals: 180,
        assists: 75,
        yellowCards: 10,
        redCards: 1,
      },
      contract: {
        start: "2017-07-01",
        end: "2025-06-30",
        salary: 200000,
        bonuses: {
          goal: 5000,
          assist: 2000,
        },
      },
    },
    {
      id: 2,
      name: "Virgil van Dijk",
      position: "Defender",
      nationality: "Netherlands",
      stats: {
        appearances: 200,
        goals: 20,
        assists: 10,
        yellowCards: 15,
        redCards: 2,
      },
      contract: {
        start: "2018-01-01",
        end: "2025-06-30",
        salary: 220000,
        bonuses: {
          cleanSheet: 3000,
        },
      },
    },
    {
      id: 3,
      name: "Alisson Becker",
      position: "Goalkeeper",
      nationality: "Brazil",
      stats: {
        appearances: 150,
        cleanSheets: 70,
        yellowCards: 2,
        redCards: 0,
      },
      contract: {
        start: "2018-07-01",
        end: "2026-06-30",
        salary: 150000,
        bonuses: {
          cleanSheet: 5000,
        },
      },
    },
  ];
  
  export const matches = [
    {
      id: 1,
      date: "2024-10-01",
      opponent: "Manchester United",
      result: {
        score: "3-1",
        goals: [
          { playerId: 1, minute: 23 }, 
          { playerId: 4, minute: 57 },
          { playerId: 1, minute: 78 },
        ],
      },
      lineup: {
        starting: [1, 2, 3],
        substitutes: [5, 6],
      },
      stadium: {
        name: "Anfield",
        capacity: 54000,
        location: "Liverpool, UK",
      },
    },
    {
      id: 2,
      date: "2024-10-08",
      opponent: "Everton",
      result: {
        score: "2-0",
        goals: [
          { playerId: 5, minute: 45 },
          { playerId: 6, minute: 67 },
        ],
      },
      lineup: {
        starting: [1, 2, 3],
        substitutes: [5, 6],
      },
      stadium: {
        name: "Anfield",
        capacity: 54000,
        location: "Liverpool, UK",
      },
    },
  ];
  
  export const trophies = [
    {
      id: 1,
      name: "Premier League",
      seasonsWon: [2019, 2020],
      topScorer: { playerId: 1, goals: 32 },
      finalsWon: 2,
    },
    {
      id: 2,
      name: "Champions League",
      seasonsWon: [2005, 2019],
      topScorer: { playerId: 1, goals: 10 },
      finalsWon: 2,
    },
    {
      id: 3,
      name: "FA Cup",
      seasonsWon: [2006, 2022],
      topScorer: { playerId: 2, goals: 5 },
      finalsWon: 2,
    },
  ];
  
// export default {players, matches, trophies};