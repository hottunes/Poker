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

    getRecentStats(count = 100) {
        const recentLogs = this.logs.slice(-count);
        const stats = {
            totalTournaments: recentLogs.length,
            totalPrize: 0,
            totalBuyIn: 0,
            finalTableCount: 0,
            inMoneyCount: 0,
            averageRank: 0,
            bestRank: Infinity,
            worstRank: 0,
            totalProfit: 0,
            byType: {
                local: { count: 0, totalPrize: 0, totalBuyIn: 0 },
                online: { count: 0, totalPrize: 0, totalBuyIn: 0 },
                major: { count: 0, totalPrize: 0, totalBuyIn: 0 },
            },
        };

        recentLogs.forEach((log) => {
            const result = log.result;
            stats.totalPrize += result.prize;
            stats.totalBuyIn += log.tournamentInfo.buyIn;
            stats.totalProfit += result.prize - log.tournamentInfo.buyIn;

            if (result.isFinalTable) stats.finalTableCount++;
            if (result.isInMoney) stats.inMoneyCount++;

            stats.bestRank = Math.min(stats.bestRank, result.rank);
            stats.worstRank = Math.max(stats.worstRank, result.rank);

            stats.byType[result.type].count++;
            stats.byType[result.type].totalPrize += result.prize;
            stats.byType[result.type].totalBuyIn += log.tournamentInfo.buyIn;
        });

        stats.averageRank =
            recentLogs.reduce((sum, log) => sum + log.result.rank, 0) /
            recentLogs.length;

        return stats;
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
