export class TournamentLogger {
    constructor() {
        this.logs = [];
        this.loadLogs();
    }

    loadLogs() {
        const savedLogs = localStorage.getItem("tournamentLogs");
        if (savedLogs) {
            this.logs = JSON.parse(savedLogs);
        }
    }

    saveLogs() {
        localStorage.setItem("tournamentLogs", JSON.stringify(this.logs));
    }

    addLog(character, result, tournamentInfo) {
        const log = {
            timestamp: Date.now(),
            character: {
                name: character.name,
                resources: { ...character.resources },
            },
            result: {
                rank: result.rank,
                prize: result.prize,
                score: result.score,
                isInMoney: result.isInMoney,
                isFinalTable: result.isFinalTable,
                totalPlayers: result.totalPlayers,
            },
            tournamentInfo: {
                type: tournamentInfo.type,
                buyIn: tournamentInfo.buyIn,
                prizePool: tournamentInfo.prizePool,
                maxPlayers: tournamentInfo.maxPlayers,
            },
        };

        this.logs.push(log);
        this.saveLogs();
    }

    getLogs() {
        return this.logs;
    }

    getPlayerLogs(playerName) {
        return this.logs.filter((log) => log.character.name === playerName);
    }

    getRecentLogs(count = 10) {
        return this.logs.slice(-count);
    }

    getTournamentTypeLogs(type) {
        return this.logs.filter((log) => log.tournamentInfo.type === type);
    }

    getLogStats(playerName) {
        const playerLogs = this.getPlayerLogs(playerName);
        return {
            totalGames: playerLogs.length,
            victories: playerLogs.filter((log) => log.result.rank === 1).length,
            itmCount: playerLogs.filter((log) => log.result.isInMoney).length,
            finalTableCount: playerLogs.filter((log) => log.result.isFinalTable)
                .length,
        };
    }

    resetStats() {
        this.logs = [];
        this.saveLogs();
    }
}
