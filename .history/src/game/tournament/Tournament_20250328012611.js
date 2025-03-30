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
        // 파이널 테이블 참가자들의 점수 재계산
        const finalTableScores = [];

        // 플레이어의 파이널 테이블 점수 계산
        const playerScore = this.calculateFinalTableScore(character);
        finalTableScores.push({
            character: character,
            score: playerScore,
            initialRank: initialRank,
        });

        // NPC들의 파이널 테이블 점수 계산 (원래 8등 안에 든 NPC들)
        const qualifiedNPCs = this.results
            .filter((r) => r.rank <= 9 && r.rank !== initialRank)
            .map((r) => ({
                character: r.character,
                score: this.calculateFinalTableScore(null), // NPC용 점수 계산
                initialRank: r.rank,
            }));

        finalTableScores.push(...qualifiedNPCs);

        // 최종 순위 결정
        finalTableScores.sort((a, b) => b.score - a.score);

        // 최종 순위 및 상금 계산
        const finalRank =
            finalTableScores.findIndex((s) => s.character === character) + 1;
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
            finalTableScores, // 파이널 테이블 전체 결과 포함
        };

        // 결과 기록
        this.results.push(result);
        this.addLog(character, result);

        return result;
    }

    // 파이널 테이블 점수 계산 (운의 영향 증가)
    calculateFinalTableScore(character) {
        if (!character) {
            // NPC의 경우
            const baseScore = 50 + (Math.random() * 30 - 15); // 35-65 범위
            const npcSkillBonus = 0.6 * 15; // 고정된 NPC 스킬
            const luckFactor = Math.random() * 40 - 20; // -20 ~ +20 운 요소
            return Math.max(
                0,
                Math.min(100, baseScore + npcSkillBonus + luckFactor)
            );
        }

        // 플레이어의 경우
        const stats = character.getStats();
        const skillBonus =
            (stats.pokerIQ * 0.3 +
                stats.insight * 0.25 +
                stats.gtoMastery * 0.2 +
                stats.focus * 0.15 +
                stats.stamina * 0.05 +
                stats.luck * 0.05) /
            100;

        const baseScore = 50 + (Math.random() * 30 - 15); // 35-65 범위
        const skillScore = skillBonus * 15;

        // 파이널 테이블에서는 운의 영향이 매우 큼
        const luckFactor = Math.random() * 40 - 20; // -20 ~ +20 운 요소

        let finalScore = baseScore + skillScore + luckFactor;
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
        const stats = character.getStats();

        // 스킬 점수 계산 (0-1 사이 값)
        const skillBonus =
            (stats.pokerIQ * 0.3 +
                stats.insight * 0.25 +
                stats.gtoMastery * 0.2 +
                stats.focus * 0.15 +
                stats.stamina * 0.05 +
                stats.luck * 0.05) /
            100;

        // Box-Muller 변환을 사용한 정규분포 생성 (평균 50, 표준편차 15)
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        const baseScore = 50 + z * 15;

        // 스킬 보너스 (최대 15점으로 감소)
        const skillScore = skillBonus * 15;

        // 운 요소를 정규분포로 변경 (평균 0, 표준편차는 스킬이 높을수록 증가)
        const u3 = Math.random();
        const u4 = Math.random();
        const z2 =
            Math.sqrt(-2.0 * Math.log(u3)) * Math.cos(2.0 * Math.PI * u4);

        // 스킬이 높을수록 운의 영향이 커짐 (표준편차 10~20)
        const luckStdDev = 10 + skillBonus * 10;
        const luckFactor = z2 * luckStdDev;

        // 최종 점수 = 기본 점수 + 스킬 보너스 + 운 요소
        let finalScore = baseScore + skillScore + luckFactor;

        // 점수 범위 제한 (0-100)
        finalScore = Math.max(0, Math.min(100, finalScore));

        return finalScore;
    }

    // NPC 점수 생성
    generateNPCScore() {
        // Box-Muller 변환을 사용한 정규분포 생성 (평균 50, 표준편차 15)
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        const baseScore = 50 + z * 15;

        // 고정된 NPC 스킬 레벨
        const npcSkillLevel = 0.6;

        // 스킬 보너스 (최대 15점으로 감소)
        const skillScore = npcSkillLevel * 15;

        // 운 요소를 정규분포로 변경 (평균 0, 표준편차는 스킬에 비례)
        const u3 = Math.random();
        const u4 = Math.random();
        const z2 =
            Math.sqrt(-2.0 * Math.log(u3)) * Math.cos(2.0 * Math.PI * u4);

        // NPC도 스킬이 높으므로 운의 영향이 큼
        const luckStdDev = 10 + npcSkillLevel * 10;
        const luckFactor = z2 * luckStdDev;

        // 최종 점수 계산
        let finalScore = baseScore + skillScore + luckFactor;
        finalScore = Math.max(0, Math.min(100, finalScore));

        return finalScore;
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
            (stats.finalTableCount / playerLogs.length) * 100; // 파이널 테이블 진출률 계산

        stats.itmRate = Number(itmRate.toFixed(2));
        stats.winRate = Number(winRate.toFixed(2));
        stats.finalTableRate = Number(finalTableRate.toFixed(2)); // 파이널 테이블 진출률 추가

        return stats;
    }
}
