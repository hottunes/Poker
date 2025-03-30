export class TournamentLogger {
    constructor() {
        this.logs = JSON.parse(localStorage.getItem("tournamentLogs") || "[]");
    }

    // 로그 추가
    addLog(character, result, tournamentInfo) {
        const log = {
            timestamp: new Date().toISOString(),
            tournamentType: tournamentInfo.type,
            buyIn: tournamentInfo.buyIn,
            prizePool: tournamentInfo.prizePool,
            playerName: character.name,
            rank: result.rank,
            totalPlayers: tournamentInfo.maxPlayers,
            prize: result.prize,
            score: Math.round(result.score),
        };

        this.logs.push(log);
        this.saveLogs();
    }

    // 로그 저장
    saveLogs() {
        localStorage.setItem("tournamentLogs", JSON.stringify(this.logs));
    }

    // 모든 로그 조회
    getLogs() {
        return this.logs;
    }

    // 특정 플레이어의 로그 조회
    getPlayerLogs(playerName) {
        return this.logs.filter((log) => log.playerName === playerName);
    }

    // 최근 N개의 로그 조회
    getRecentLogs(count = 10) {
        return this.logs.slice(-count);
    }

    // 특정 타입의 토너먼트 로그 조회
    getTournamentTypeLogs(type) {
        return this.logs.filter((log) => log.tournamentType === type);
    }

    // 로그 통계 조회
    getLogStats(playerName) {
        const playerLogs = this.getPlayerLogs(playerName);
        if (playerLogs.length === 0) return null;

        const stats = {
            totalGames: playerLogs.length,
            totalPrize: 0,
            bestRank: Infinity,
            averageRank: 0,
            itmCount: 0,
            winCount: 0,
            finalTableCount: 0,
            totalBuyIn: 0,
        };

        playerLogs.forEach((log) => {
            stats.totalPrize += log.prize;
            stats.totalBuyIn += log.buyIn;
            stats.bestRank = Math.min(stats.bestRank, log.rank);
            stats.averageRank += log.rank;
            if (log.prize > 0) stats.itmCount++;
            if (log.rank === 1) stats.winCount++;
            if (log.rank <= 9) stats.finalTableCount++;
        });

        stats.averageRank = Math.round(stats.averageRank / playerLogs.length);
        stats.roi =
            stats.totalBuyIn > 0
                ? Number(
                      (
                          ((stats.totalPrize - stats.totalBuyIn) /
                              stats.totalBuyIn) *
                          100
                      ).toFixed(2)
                  )
                : 0;

        const itmRate = (stats.itmCount / playerLogs.length) * 100;
        const winRate = (stats.winCount / playerLogs.length) * 100;
        const finalTableRate =
            (stats.finalTableCount / playerLogs.length) * 100;

        stats.itmRate = Number(itmRate.toFixed(2));
        stats.winRate = Number(winRate.toFixed(2));
        stats.finalTableRate = Number(finalTableRate.toFixed(2));

        return stats;
    }

    // 토너먼트 통계 리셋
    resetStats() {
        this.logs = [];
        localStorage.removeItem("tournamentLogs");
    }
}
