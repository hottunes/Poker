export class TournamentStats {
    constructor(logger, buyIn) {
        this.logger = logger;
        this.buyIn = buyIn;
    }

    getStats() {
        const logs = this.logger.getLogs();
        if (!logs || logs.length === 0) {
            return {
                roi: 0,
                itm: 0,
                finalTable: 0,
                victories: 0,
                averageRank: 0,
            };
        }

        // 최근 100경기만 사용
        const recentLogs = logs.slice(-100);

        // 총 투자 금액
        const totalInvestment = logs.length * this.buyIn;

        // 총 상금
        const totalPrize = logs.reduce((sum, log) => {
            if (!log || !log.result) return sum;
            return sum + (log.result.prize || 0);
        }, 0);

        // ROI 계산 ((총 상금 - 총 투자) / 총 투자 * 100)
        const roi =
            totalInvestment > 0
                ? ((totalPrize - totalInvestment) / totalInvestment) * 100
                : 0;

        // ITM 비율 (상금권 진입 횟수 / 전체 게임 수 * 100)
        const itmCount = logs.filter(
            (log) => log && log.result && log.result.prize > 0
        ).length;
        const itm = (itmCount / logs.length) * 100;

        // 파이널 테이블 진출률 (파이널 테이블 진출 횟수 / 전체 게임 수 * 100)
        const finalTableCount = logs.filter(
            (log) => log && log.result && log.result.rank <= 9
        ).length;
        const finalTable = (finalTableCount / logs.length) * 100;

        // 우승 횟수
        const victories = logs.filter(
            (log) => log && log.result && log.result.rank === 1
        ).length;

        // 최근 100경기 평균 등수 계산
        const totalRank = recentLogs.reduce((sum, log) => {
            if (!log || !log.result) return sum;
            return sum + (log.result.rank || 0);
        }, 0);
        const averageRank =
            recentLogs.length > 0
                ? (totalRank / recentLogs.length).toFixed(1)
                : 0;

        return {
            roi,
            itm,
            finalTable,
            victories,
            averageRank,
        };
    }

    resetStats() {
        this.logger.resetStats();
    }
}
