export class Tournament {
    constructor(type, buyIn, maxPlayers) {
        this.type = type; // 'local', 'online', 'major'
        this.buyIn = buyIn;
        this.maxPlayers = maxPlayers;
        this.currentPlayers = maxPlayers; // 시작부터 가득 차있도록 설정
        this.status = "open"; // 'open', 'in_progress', 'completed'
        this.players = [];
        this.results = [];

        // 상금 계산 (바이인의 90%가 상금풀로)
        this.prizePool = Math.floor(this.buyIn * this.maxPlayers * 0.9);

        // 토너먼트 로그 초기화
        this.logs = JSON.parse(localStorage.getItem("tournamentLogs") || "[]");
    }

    // 토너먼트 참가 가능 여부 확인
    canEnter(character) {
        const energyRequired = this.type === "online" ? 0 : 20;
        return (
            this.status === "open" &&
            character.resources.bankroll >= this.buyIn &&
            character.resources.energy >= energyRequired
        );
    }

    // 토너먼트 참가
    enter(character) {
        if (!this.canEnter(character)) {
            return {
                success: false,
                message: "토너먼트 참가가 불가능합니다.",
            };
        }

        // 참가비 지불
        character.modifyResource("bankroll", -this.buyIn);

        // 오프라인 토너먼트만 에너지 소모
        if (this.type !== "online") {
            character.modifyResource("energy", -20);
        }

        // NPC로 나머지 자리 채우기
        this.currentPlayers = this.maxPlayers;
        this.generateNPCResults();

        // 플레이어 초기 결과 계산 (파이널 테이블 진출 여부 결정)
        const initialResult = this.calculateInitialResult(character);

        // 파이널 테이블 진출 시 (9등 이내)
        if (initialResult.rank <= 9) {
            return {
                success: true,
                result: initialResult,
                finalTable: true,
                message: "파이널 테이블 진출!",
            };
        }

        // 파이널 테이블 진출 실패 시 바로 결과 기록
        this.results.push(initialResult);
        this.addLog(character, initialResult);

        return {
            success: true,
            result: initialResult,
            finalTable: false,
        };
    }

    // 초기 결과 계산 (파이널 테이블 진출 여부 결정)
    calculateInitialResult(character) {
        const score = this.calculateScore(character);
        const totalPlayers = this.maxPlayers;
        const rank = this.calculateRank(score);
        const prize = this.calculatePrize(rank);
        const percentile = (rank / totalPlayers) * 100;

        // 상금이 있는 경우 즉시 지급
        if (prize > 0) {
            character.modifyResource("bankroll", prize);
            const reputationGain =
                Math.floor(prize / 100) +
                this.calculateITMBonus(rank, totalPlayers);
            character.modifyResource("reputation", reputationGain);
        }

        return {
            character,
            score,
            rank,
            prize,
            percentile,
            totalPlayers,
        };
    }

    // 파이널 테이블 진행
    playFinalTable(character, initialRank) {
        // 플레이어의 파이널 테이블 점수 계산
        const playerScore = this.calculateFinalTableScore(character);

        // 1-9등 사이의 랜덤한 순위 결정 (점수 기반)
        const finalRank = Math.min(
            9,
            Math.max(1, Math.floor((playerScore / 100) * 9) + 1)
        );

        // 순위에 따른 상금 계산
        const prize = this.calculatePrize(finalRank);

        // 상금 지급
        if (prize > 0) {
            character.modifyResource("bankroll", prize);
            const reputationGain =
                Math.floor(prize / 100) +
                this.calculateITMBonus(finalRank, this.maxPlayers);
            character.modifyResource("reputation", reputationGain);
        }

        const result = {
            character,
            score: playerScore,
            rank: finalRank,
            prize,
            percentile: (finalRank / this.maxPlayers) * 100,
            totalPlayers: this.maxPlayers,
            isFinalTable: true,
        };

        // 결과 기록
        this.results.push(result);
        this.addLog(character, result);

        return result;
    }

    // 파이널 테이블 점수 계산
    calculateFinalTableScore(character) {
        // 스킬 점수 계산 (최대 60점)
        const weights = {
            strategy: 0.35, // 전략
            analysis: 0.2, // 분석력 - 파이널 테이블에서 매우 중요
            insight: 0.25, // 통찰력
            mentalFocus: 0.15, // 정신 집중력
            stamina: 0.05, // 체력
        };

        // 기본 스킬 점수 계산
        let skillScore = 0;
        const stats = character.getStats();
        skillScore += stats.strategy * weights.strategy;
        skillScore += stats.analysis * weights.analysis;
        skillScore += stats.insight * weights.insight;
        skillScore += stats.mentalFocus * weights.mentalFocus;
        skillScore += stats.stamina * weights.stamina;

        // 스킬 점수를 0-60점 범위로 정규화 (1000을 기준으로)
        skillScore = (skillScore / 1000) * 60;

        // 파이널 테이블에서는 운의 영향이 더 극적
        // Box-Muller 변환을 사용한 정규분포 생성 (평균 20, 표준편차 10)
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        const luckScore = Math.max(0, Math.min(40, 20 + z * 10));

        // 최종 점수 = 스킬 점수(60%) + 운 점수(40%)
        const finalScore = skillScore + luckScore;

        return Math.max(0, Math.min(100, finalScore));
    }

    // 결과 계산
    calculateResult(character) {
        const score = this.calculateScore(character);
        const totalPlayers = this.maxPlayers;
        const rank = this.calculateRank(score);
        const prize = this.calculatePrize(rank);
        const percentile = (rank / totalPlayers) * 100;

        // 상금 지급
        if (prize > 0) {
            character.modifyResource("bankroll", prize);
            // ITM 달성 시 추가 명성 부여
            const reputationGain =
                Math.floor(prize / 100) +
                this.calculateITMBonus(rank, totalPlayers);
            character.modifyResource("reputation", reputationGain);
        }

        return {
            character,
            score,
            rank,
            prize,
            percentile,
            totalPlayers,
        };
    }

    // 점수 계산
    calculateScore(character) {
        // 스킬 점수 계산 (최대 60점)
        const weights = {
            strategy: 0.35, // 전략
            analysis: 0.2, // 분석력
            insight: 0.25, // 통찰력
            mentalFocus: 0.15, // 정신 집중력
            stamina: 0.05, // 체력
        };

        // 기본 스킬 점수 계산 (0-60점 범위)
        let skillScore = 0;
        skillScore += character.stats.strategy * weights.strategy;
        skillScore += character.stats.analysis * weights.analysis;
        skillScore += character.stats.insight * weights.insight;
        skillScore += character.stats.mentalFocus * weights.mentalFocus;
        skillScore += character.stats.stamina * weights.stamina;

        // 스킬 점수를 0-60점 범위로 정규화 (1000을 기준으로)
        skillScore = (skillScore / 1000) * 60;

        // 토너먼트 진행 상황에 따라 분석력의 중요도 증가
        const remainingPlayersRatio = this.currentPlayers / this.maxPlayers;
        const analysisBonus =
            (1 - remainingPlayersRatio) *
            (character.stats.analysis / 1000) *
            10;
        skillScore += analysisBonus;

        // 운 점수 계산 (0-40점 범위)
        // Box-Muller 변환을 사용한 정규분포 생성 (평균 20, 표준편차 8)
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        const luckScore = Math.max(0, Math.min(40, 20 + z * 8));

        // 최종 점수 = 스킬 점수(60%) + 운 점수(40%)
        const finalScore = skillScore + luckScore;

        return Math.floor(finalScore);
    }

    // NPC 점수 생성
    generateNPCScore() {
        // NPC 스킬 레벨 (0-60점 범위)
        const baseSkillLevel = 30; // 기본 스킬 레벨 (300 스탯에 해당, 50% 수준)

        // 스킬 레벨에 약간의 변동성 추가 (±6점)
        const skillVariation = Math.random() * 12 - 6;
        const skillScore = Math.max(
            0,
            Math.min(60, baseSkillLevel + skillVariation)
        );

        // 운 점수 계산 (0-40점 범위)
        // Box-Muller 변환을 사용한 정규분포 생성 (평균 20, 표준편차 8)
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        const luckScore = Math.max(0, Math.min(40, 20 + z * 8));

        // 최종 점수 = 스킬 점수(60%) + 운 점수(40%)
        const finalScore = skillScore + luckScore;

        return Math.max(0, Math.min(100, finalScore));
    }

    generateNPCResults() {
        // 기존 결과 초기화
        this.results = [];

        // maxPlayers - 1 만큼의 NPC 생성 (플레이어 한 자리 제외)
        for (let i = 0; i < this.maxPlayers - 1; i++) {
            const npcScore = this.generateNPCScore();

            this.results.push({
                character: { name: `NPC ${i + 1}` },
                score: npcScore,
                rank: 0,
                prize: 0,
            });
        }
    }

    // 토너먼트 정보 반환
    getInfo() {
        return {
            name: this.type,
            buyIn: this.buyIn,
            prizePool: this.prizePool,
            maxPlayers: this.maxPlayers,
            currentPlayers: this.currentPlayers,
            type: this.type,
            status: this.status,
            itmCount: Math.floor(this.maxPlayers * 0.15), // ITM 비율을 15%로 수정
        };
    }

    // 결과 정보 반환
    getResults() {
        return [...this.results].sort((a, b) => a.rank - b.rank);
    }

    // 순위별 상금 계산
    calculatePrize(rank) {
        if (this.maxPlayers !== 1000) {
            // 1000명이 아닌 토너먼트는 기본 상금 구조 사용
            const prizeStructure = [0.25, 0.15, 0.1, 0.08, 0.06];
            if (rank <= prizeStructure.length) {
                return Math.floor(this.prizePool * prizeStructure[rank - 1]);
            }
            return 0;
        }

        // 1000명 토너먼트 상금 구조
        const prizeStructure = {
            1: 0.23,
            2: 0.135,
            3: 0.085,
            4: 0.065,
            5: 0.055,
            6: 0.039,
            7: 0.029,
            8: 0.019,
            9: 0.013,
            10: 0.01,
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
        };

        // 순위에 따른 상금 계산
        if (rank <= 10) {
            return Math.floor(this.prizePool * prizeStructure[rank]);
        } else if (rank <= 15) {
            return Math.floor(this.prizePool * prizeStructure["11-15"]);
        } else if (rank <= 20) {
            return Math.floor(this.prizePool * prizeStructure["16-20"]);
        } else if (rank <= 25) {
            return Math.floor(this.prizePool * prizeStructure["21-25"]);
        } else if (rank <= 30) {
            return Math.floor(this.prizePool * prizeStructure["26-30"]);
        } else if (rank <= 35) {
            return Math.floor(this.prizePool * prizeStructure["31-35"]);
        } else if (rank <= 40) {
            return Math.floor(this.prizePool * prizeStructure["36-40"]);
        } else if (rank <= 50) {
            return Math.floor(this.prizePool * prizeStructure["41-50"]);
        } else if (rank <= 60) {
            return Math.floor(this.prizePool * prizeStructure["51-60"]);
        } else if (rank <= 75) {
            return Math.floor(this.prizePool * prizeStructure["61-75"]);
        } else if (rank <= 100) {
            return Math.floor(this.prizePool * prizeStructure["76-100"]);
        }
        return 0;
    }

    // 순위 계산
    calculateRank(playerScore) {
        // 모든 결과의 점수를 배열로 만들고 플레이어 점수 추가
        const scores = [...this.results.map((r) => r.score), playerScore];

        // 점수 내림차순 정렬
        scores.sort((a, b) => b - a);

        // 플레이어 점수의 순위 찾기 (1-based index)
        return scores.indexOf(playerScore) + 1;
    }

    // ITM 보너스 계산
    calculateITMBonus(rank, totalPlayers) {
        // 상금이 있는 순위에 따른 보너스 계산
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

    // 로그 추가
    addLog(character, result) {
        const log = {
            timestamp: new Date().toISOString(),
            tournamentType: this.type,
            buyIn: this.buyIn,
            prizePool: this.prizePool,
            playerName: character.name,
            rank: result.rank,
            totalPlayers: this.maxPlayers,
            prize: result.prize,
            score: Math.round(result.score),
        };

        this.logs.push(log);

        // 로컬 스토리지에 저장
        localStorage.setItem("tournamentLogs", JSON.stringify(this.logs));
    }

    // 로그 조회
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
        };

        playerLogs.forEach((log) => {
            stats.totalPrize += log.prize;
            stats.bestRank = Math.min(stats.bestRank, log.rank);
            stats.averageRank += log.rank;
            if (log.prize > 0)
                // 상금이 있으면 ITM
                stats.itmCount++;
            if (log.rank === 1) stats.winCount++;
            if (log.rank <= 9) stats.finalTableCount++;
        });

        stats.averageRank = Math.round(stats.averageRank / playerLogs.length);

        // 소수점 둘째자리까지 표시하도록 수정
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
