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

        this.prizeStructure = {
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
                message: "파이널 테이블에 진출했습니다! 결과를 확인해주세요.",
                pendingResult: true, // 결과 확인 대기 상태 표시
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

    // 스탯을 정규화하고 가중치를 적용하여 실력 점수 계산 (0~1 범위)
    calculateSkill(character) {
        const weights = {
            strategy: 0.35, // 전략: 35%
            analysis: 0.2, // 분석력: 20%
            insight: 0.25, // 통찰력: 25%
            mentalFocus: 0.15, // 정신 집중력: 15%
            stamina: 0.05, // 체력: 5%
        };

        // 각 스탯을 0~1 범위로 정규화
        const normalized = {
            strategy: character.stats.strategy / 999,
            analysis: character.stats.analysis / 999,
            insight: character.stats.insight / 999,
            mentalFocus: character.stats.mentalFocus / 999,
            stamina: character.stats.stamina / 999,
        };

        // 가중치 적용하여 실력 점수 계산
        return (
            normalized.strategy * weights.strategy +
            normalized.analysis * weights.analysis +
            normalized.insight * weights.insight +
            normalized.mentalFocus * weights.mentalFocus +
            normalized.stamina * weights.stamina
        );
    }

    // 실력과 운을 결합하여 최종 퍼포먼스 점수 계산
    calculateScore(character) {
        const skill = this.calculateSkill(character);
        const luck = Math.random(); // 순수 운 (0~1)
        return 0.6 * skill + 0.4 * luck; // 실력 60%, 운 40%
    }

    // 순위에 따른 상금 비율 계산
    getPrizeShare(rank) {
        if (this.prizeStructure[rank]) {
            return this.prizeStructure[rank];
        }
        // 범위 형태의 key 확인
        for (let key in this.prizeStructure) {
            if (key.includes("-")) {
                let [low, high] = key.split("-").map(Number);
                if (rank >= low && rank <= high) {
                    return this.prizeStructure[key];
                }
            }
        }
        return 0; // 상금 구조에 포함되지 않으면 0 지급
    }

    // 토너먼트 결과 계산
    calculateInitialResult(character) {
        const playerScore = this.calculateScore(character);

        // NPC 점수 생성 (999명)
        const npcScores = Array.from({ length: 999 }, () =>
            this.generateNPCScore()
        );

        // 모든 점수를 합쳐서 정렬
        const allScores = [...npcScores, playerScore];
        const sortedScores = [...allScores].sort((a, b) => b - a);

        // 플레이어 순위 계산 (1-based)
        const rank = sortedScores.indexOf(playerScore) + 1;

        // 상금 계산
        const prizeShare = this.getPrizeShare(rank);
        const prize = Math.floor(this.prizePool * prizeShare);

        // 결과 반환
        return {
            rank,
            prize,
            score: playerScore,
            isInMoney: prize > 0,
            isFinalTable: rank <= 9,
            totalPlayers: this.maxPlayers, // 총 참가자 수 추가
            character, // 캐릭터 정보도 추가
        };
    }

    // NPC 점수 생성
    generateNPCScore() {
        // NPC의 기본 실력을 0.4로 설정하고, ±0.15의 변동성 추가
        const baseSkill = 0.4;
        const skillVariation = Math.random() * 0.3 - 0.15; // -0.15 ~ 0.15 사이의 변동성
        const skill = Math.max(0, Math.min(1, baseSkill + skillVariation)); // 0~1 범위로 제한

        const luck = Math.random(); // 0~1 범위의 운
        return 0.6 * skill + 0.4 * luck; // 실력 60%, 운 40%
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
            buyIn: this.buyIn,
            prizePool: this.buyIn * this.maxPlayers * 0.9, // 90%가 상금으로 돌아감
            currentPlayers: this.maxPlayers,
            maxPlayers: this.maxPlayers,
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

        // 1000명 토너먼트의 경우 constructor에서 정의된 prizeStructure 사용
        return Math.floor(this.prizePool * this.getPrizeShare(rank));
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
            totalBuyIn: 0, // 총 참가비 추가
        };

        playerLogs.forEach((log) => {
            stats.totalPrize += log.prize;
            stats.totalBuyIn += log.buyIn; // 참가비 누적
            stats.bestRank = Math.min(stats.bestRank, log.rank);
            stats.averageRank += log.rank;
            if (log.prize > 0) stats.itmCount++;
            if (log.rank === 1) stats.winCount++;
            if (log.rank <= 9) stats.finalTableCount++;
        });

        stats.averageRank = Math.round(stats.averageRank / playerLogs.length);

        // ROI 계산: (총 상금 - 총 참가비) / 총 참가비 * 100
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

    // 파이널 테이블 결과 확인
    getFinalTableResult(character, initialResult) {
        // 상금 계산
        const prizeShare = this.getPrizeShare(initialResult.rank);
        const prize = Math.floor(this.prizePool * prizeShare);

        // 결과 객체 생성
        const finalResult = {
            ...initialResult,
            prize,
            isInMoney: prize > 0,
        };

        // 상금 지급
        if (prize > 0) {
            character.modifyResource("bankroll", prize);
            const reputationGain =
                Math.floor(prize / 100) +
                this.calculateITMBonus(finalResult.rank, this.maxPlayers);
            character.modifyResource("reputation", reputationGain);
        }

        // 결과 기록
        this.results.push(finalResult);
        this.addLog(character, finalResult);

        return {
            success: true,
            result: finalResult,
            finalTable: true,
            message: "파이널 테이블 결과가 확정되었습니다!",
        };
    }
}
