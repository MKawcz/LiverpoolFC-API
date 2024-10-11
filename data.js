const liverpoolFCData = {
    clubName: "Liverpool FC",
    established: 1892,
    stadium: "Anfield",
    capacity: 54074,
    manager: {
        name: "Jürgen Klopp",
        nationality: "German",
        tenureStart: "October 2015",
        achievements: [
            "Premier League Champion (2019-20)",
            "UEFA Champions League Winner (2018-19)",
            "FIFA Club World Cup Winner (2019)",
            "UEFA Super Cup Winner (2019)",
            "Football Writers' Association Footballer of the Year"
        ]
    },
    players: [
        {
            name: "Mohamed Salah",
            position: "Forward",
            age: 32,
            nationality: "Egyptian",
            appearances: 200,
            goals: 130,
            assists: 50
        },
        {
            name: "Virgil van Dijk",
            position: "Defender",
            age: 33,
            nationality: "Dutch",
            appearances: 180,
            goals: 15,
            assists: 5
        },
        {
            name: "Alisson Becker",
            position: "Goalkeeper",
            age: 31,
            nationality: "Brazilian",
            appearances: 150,
            goals: 1,
            assists: 2
        },
        {
            name: "Sadio Mané",
            position: "Forward",
            age: 32,
            nationality: "Senegalese",
            appearances: 269,
            goals: 120,
            assists: 40
        },
        {
            name: "Trent Alexander-Arnold",
            position: "Defender",
            age: 25,
            nationality: "English",
            appearances: 250,
            goals: 10,
            assists: 60
        },
        {
            name: "Fabinho",
            position: "Midfielder",
            age: 30,
            nationality: "Brazilian",
            appearances: 180,
            goals: 10,
            assists: 15
        },
        {
            name: "Jordan Henderson",
            position: "Midfielder",
            age: 34,
            nationality: "English",
            appearances: 350,
            goals: 30,
            assists: 50
        },
        {
            name: "Diogo Jota",
            position: "Forward",
            age: 27,
            nationality: "Portuguese",
            appearances: 100,
            goals: 35,
            assists: 15
        },
        {
            name: "Luis Díaz",
            position: "Forward",
            age: 27,
            nationality: "Colombian",
            appearances: 60,
            goals: 20,
            assists: 10
        },
        {
            name: "Ibrahima Konaté",
            position: "Defender",
            age: 24,
            nationality: "French",
            appearances: 80,
            goals: 5,
            assists: 2
        },
        {
            name: "Cody Gakpo",
            position: "Forward",
            age: 24,
            nationality: "Dutch",
            appearances: 40,
            goals: 15,
            assists: 5
        },
        {
            name: "Harvey Elliott",
            position: "Midfielder",
            age: 21,
            nationality: "English",
            appearances: 70,
            goals: 5,
            assists: 10
        },
        {
            name: "Curtis Jones",
            position: "Midfielder",
            age: 23,
            nationality: "English",
            appearances: 60,
            goals: 6,
            assists: 8
        }
        // Add more players as needed
    ],
    matches: [
        {
            date: "2023-09-15",
            opponent: "Manchester United",
            competition: "Premier League",
            home: true,
            score: "3-1",
            goalscorers: [
                { player: "Mohamed Salah", time: "25'" },
                { player: "Sadio Mané", time: "45+2'" },
                { player: "Virgil van Dijk", time: "80'" }
            ]
        },
        {
            date: "2023-09-21",
            opponent: "Chelsea",
            competition: "Carabao Cup",
            home: false,
            score: "2-0",
            goalscorers: [
                { player: "Trent Alexander-Arnold", time: "15'" },
                { player: "Alisson Becker", time: "90+1'" }
            ]
        },
        {
            date: "2023-09-30",
            opponent: "Arsenal",
            competition: "Premier League",
            home: true,
            score: "4-0",
            goalscorers: [
                { player: "Mohamed Salah", time: "10'" },
                { player: "Sadio Mané", time: "20'" },
                { player: "Trent Alexander-Arnold", time: "55'" },
                { player: "Virgil van Dijk", time: "75'" }
            ]
        },
        {
            date: "2023-10-05",
            opponent: "Manchester City",
            competition: "Premier League",
            home: false,
            score: "1-1",
            goalscorers: [
                { player: "Fabinho", time: "80'" }
            ]
        },
        {
            date: "2023-10-10",
            opponent: "Tottenham Hotspur",
            competition: "Premier League",
            home: true,
            score: "2-2",
            goalscorers: [
                { player: "Diogo Jota", time: "30'" },
                { player: "Luis Díaz", time: "60'" }
            ]
        },
        {
            date: "2023-10-15",
            opponent: "West Ham United",
            competition: "Premier League",
            home: false,
            score: "3-2",
            goalscorers: [
                { player: "Cody Gakpo", time: "15'" },
                { player: "Harvey Elliott", time: "75'" },
                { player: "Mohamed Salah", time: "90+3'" }
            ]
        }
        // Add more matches as needed
    ],
    statistics: {
        totalGoals: 900,
        totalMatches: 520,
        winPercentage: 67,
        averageGoalsPerMatch: 1.73,
        cleanSheets: 160,
        yellowCards: 120,
        redCards: 5,
        playerOfTheMatchAwards: {
            total: 30,
            topPlayer: "Mohamed Salah"
        }
    }
};
