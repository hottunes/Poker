export class TournamentPrize {
    constructor() {
        this.prizeStructure = {
            online: {
                1: 0.23, // 1위
                2: 0.135, // 2위
                3: 0.085, // 3위
                4: 0.065, // 4위
                5: 0.055, // 5위
                6: 0.055, // 6위
                7: 0.039, // 7위
                8: 0.029, // 8위
                9: 0.013, // 9위
                10: 0.01, // 10위
                "11-15": 0.01,
                "16-20": 0.007,
                "21-25": 0.006,
                "26-30": 0.005,
                "31-35": 0.0045,
                "36-40": 0.004,
                "41-50": 0.0028,
                "51-60": 0.0024,
                "61-75": 0.0022,
                "76-100": 0.0021,
            },
            highroller: {
                1: 0.27, // 1위
                2: 0.16, // 2위
                3: 0.1, // 3위
                4: 0.08, // 4위
                5: 0.07, // 5위
                6: 0.049, // 6위
                7: 0.039, // 7위
                8: 0.029, // 8위
                9: 0.024, // 9위
                10: 0.019, // 10위
                "11-15": 0.019,
                "16-20": 0.013,
            },
        };
    }

    // 순위에 따른 상금 비율 계산
    getPrizeShare(rank, type) {
        const structure = this.prizeStructure[type];
        if (!structure) return 0;

        if (structure[rank]) {
            return structure[rank];
        }

        // 범위 형태의 key 확인
        for (let key in structure) {
            if (key.includes("-")) {
                let [low, high] = key.split("-").map(Number);
                if (rank >= low && rank <= high) {
                    return structure[key];
                }
            }
        }
        return 0; // 상금 구조에 포함되지 않으면 0 지급
    }

    // 순위별 상금 계산
    calculatePrize(rank, prizePool, type) {
        const share = this.getPrizeShare(rank, type);
        return Math.floor(prizePool * share);
    }

    // ITM 순위인지 확인
    isInMoney(rank, type) {
        const structure = this.prizeStructure[type];
        if (!structure) return false;

        // 단일 순위 확인
        if (structure[rank]) return true;

        // 범위 순위 확인
        for (let key in structure) {
            if (key.includes("-")) {
                let [low, high] = key.split("-").map(Number);
                if (rank >= low && rank <= high) {
                    return true;
                }
            }
        }
        return false;
    }

    // ITM 보너스 계산
    calculateITMBonus(rank, totalPlayers) {
        const baseBonus = 100;

        if (totalPlayers === 1000) {
            // 1000명 토너먼트의 경우 100위까지 ITM
            if (rank > 100) return 0;
            return Math.floor((baseBonus * (100 - rank + 1)) / 100);
        } else {
            // 100명 토너먼트의 경우 기본 상금 구조 사용
            const prizeStructure = [0.25, 0.15, 0.1, 0.08, 0.06];
            if (rank > prizeStructure.length) return 0;
            return Math.floor(
                (baseBonus * (prizeStructure.length - rank + 1)) /
                    prizeStructure.length
            );
        }
    }
}
