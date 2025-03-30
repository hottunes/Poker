export class TournamentLogger {
    constructor() {
        this.logs = [];
    }

    logResult(result) {
        this.logs.push({
            ...result,
            timestamp: new Date().getTime(),
        });
    }

    getLogs() {
        return [...this.logs];
    }

    getStats() {
        if (this.logs.length === 0) {
            return {
                totalGames: 0,
                averageRank: 0,
                bestRank: 0,
                totalPrize: 0,
                averagePrize: 0,
            };
        }

        const totalGames = this.logs.length;
        const totalRank = this.logs.reduce((sum, log) => sum + log.rank, 0);
        const bestRank = Math.min(...this.logs.map((log) => log.rank));
        const totalPrize = this.logs.reduce(
            (sum, log) => sum + (log.prize || 0),
            0
        );

        return {
            totalGames,
            averageRank: totalRank / totalGames,
            bestRank,
            totalPrize,
            averagePrize: totalPrize / totalGames,
        };
    }

    resetLogs() {
        this.logs = [];
    }
}
