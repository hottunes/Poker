import { TournamentPrize } from "./TournamentPrize.js";
import { TournamentScore } from "./TournamentScore.js";
import { TournamentLogger } from "./TournamentLogger.js";

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

        // 서브시스템 초기화
        this.prizeSystem = new TournamentPrize();
        this.scoreSystem = new TournamentScore();
        this.logger = new TournamentLogger();

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
        this.logger.addLog(character, initialResult, {
            type: this.type,
            buyIn: this.buyIn,
            prizePool: this.prizePool,
            maxPlayers: this.maxPlayers,
        });

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
        let skillScore =
            normalized.strategy * weights.strategy +
            normalized.analysis * weights.analysis +
            normalized.insight * weights.insight +
            normalized.mentalFocus * weights.mentalFocus +
            normalized.stamina * weights.stamina;

        // 실력 점수에 약간의 변동성 추가 (±10%)
        const variation = Math.random() * 0.2 - 0.1;
        skillScore = Math.max(0, Math.min(1, skillScore * (1 + variation)));

        return skillScore;
    }

    // 실력과 운을 결합하여 최종 퍼포먼스 점수 계산
    calculateScore(character) {
        const skill = this.calculateSkill(character);
        const luck = Math.random(); // 순수 운 (0~1)

        // 토너먼트 타입에 따라 운의 영향력 조정
        let luckWeight;
        switch (this.type) {
            case "online":
                luckWeight = 0.4; // 온라인: 운 40%
                break;
            case "major":
                luckWeight = 0.3; // 메이저: 운 30%
                break;
            default:
                luckWeight = 0.35; // 일반: 운 35%
        }

        return (1 - luckWeight) * skill + luckWeight * luck;
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
        // NPC 결과 생성
        this.generateNPCResults();

        // 플레이어 점수 계산
        const playerScore = this.calculateScore(character);

        // 모든 참가자(NPC + 플레이어)의 점수를 배열로 만들기
        const allScores = [
            ...this.results.map((r) => ({ score: r.score, isPlayer: false })),
            { score: playerScore, isPlayer: true },
        ];

        // 점수로 내림차순 정렬
        allScores.sort((a, b) => b.score - a.score);

        // 플레이어의 순위 찾기
        const rank = allScores.findIndex((s) => s.isPlayer) + 1;

        // 상금 계산
        const prize = this.calculatePrize(rank, this.type);

        return {
            rank,
            prize,
            score: playerScore,
            isInMoney: prize > 0,
            isFinalTable: rank <= 9,
            totalPlayers: this.maxPlayers,
            character,
        };
    }

    // NPC 결과 생성
    generateNPCResults() {
        const npcResults = [];

        // NPC 수만큼 결과 생성
        for (let i = 0; i < this.maxPlayers - 1; i++) {
            const score = this.generateNPCScore();
            npcResults.push({
                character: { name: `NPC ${i + 1}` },
                score: score,
                rank: 0, // 순위는 나중에 계산
                prize: 0, // 상금도 나중에 계산
            });
        }

        // 생성된 NPC 결과를 점수 기준으로 정렬
        npcResults.sort((a, b) => b.score - a.score);

        // 정렬된 결과 저장
        this.results = npcResults;
    }

    // NPC 점수 생성
    generateNPCScore() {
        // 토너먼트 타입에 따라 NPC 기본 실력 조정
        let baseSkill;
        switch (this.type) {
            case "online":
                baseSkill = 0.6; // 온라인: 평균 이상 실력
                break;
            case "major":
                baseSkill = 0.8; // 메이저: 매우 높은 실력
                break;
            default:
                baseSkill = 0.7; // 일반: 높은 실력
        }

        // 더 큰 변동성 추가 (±20%)
        const skillVariation = Math.random() * 0.4 - 0.2;
        const skill = Math.max(0, Math.min(1, baseSkill + skillVariation));

        const luck = Math.random();

        // 토너먼트 타입에 따라 운의 영향력 조정
        let luckWeight;
        switch (this.type) {
            case "online":
                luckWeight = 0.4;
                break;
            case "major":
                luckWeight = 0.3;
                break;
            default:
                luckWeight = 0.35;
        }

        return (1 - luckWeight) * skill + luckWeight * luck;
    }

    // 토너먼트 정보 반환
    getInfo() {
        return {
            buyIn: this.buyIn,
            prizePool: this.prizePool,
            currentPlayers: this.maxPlayers,
            maxPlayers: this.maxPlayers,
        };
    }

    // 결과 정보 반환
    getResults() {
        return [...this.results].sort((a, b) => a.rank - b.rank);
    }

    // 순위별 상금 계산
    calculatePrize(rank, type) {
        let prizePool = this.prizePool;
        let prizePercentage = 0;

        if (type === "highroller") {
            // 200명 토너먼트
            if (rank === 1) prizePercentage = 27;
            else if (rank === 2) prizePercentage = 16;
            else if (rank === 3) prizePercentage = 10;
            else if (rank === 4) prizePercentage = 8;
            else if (rank === 5) prizePercentage = 7;
            else if (rank === 6) prizePercentage = 4.9;
            else if (rank === 7) prizePercentage = 3.9;
            else if (rank === 8) prizePercentage = 2.9;
            else if (rank === 9) prizePercentage = 2.4;
            else if (rank === 10) prizePercentage = 1.9;
            else if (rank >= 11 && rank <= 15) prizePercentage = 1.9;
            else if (rank >= 16 && rank <= 20) prizePercentage = 1.3;
        } else {
            // 1000명 토너먼트
            if (rank === 1) prizePercentage = 23;
            else if (rank === 2) prizePercentage = 13.5;
            else if (rank === 3) prizePercentage = 8.5;
            else if (rank === 4) prizePercentage = 6.5;
            else if (rank === 5) prizePercentage = 5.5;
            else if (rank === 6) prizePercentage = 5.5;
            else if (rank === 7) prizePercentage = 3.9;
            else if (rank === 8) prizePercentage = 2.9;
            else if (rank === 9) prizePercentage = 1.3;
            else if (rank === 10) prizePercentage = 1.0;
            else if (rank >= 11 && rank <= 15) prizePercentage = 1.0;
            else if (rank >= 16 && rank <= 20) prizePercentage = 0.7;
            else if (rank >= 21 && rank <= 25) prizePercentage = 0.6;
            else if (rank >= 26 && rank <= 30) prizePercentage = 0.5;
            else if (rank >= 31 && rank <= 35) prizePercentage = 0.45;
            else if (rank >= 36 && rank <= 40) prizePercentage = 0.4;
            else if (rank >= 41 && rank <= 50) prizePercentage = 0.28;
            else if (rank >= 51 && rank <= 60) prizePercentage = 0.24;
            else if (rank >= 61 && rank <= 75) prizePercentage = 0.22;
            else if (rank >= 76 && rank <= 100) prizePercentage = 0.21;
        }

        return Math.floor(prizePool * (prizePercentage / 100));
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

    // 로그 조회
    getLogs() {
        return this.logger.getLogs();
    }

    // 특정 플레이어의 로그 조회
    getPlayerLogs(playerName) {
        return this.logger.getPlayerLogs(playerName);
    }

    // 최근 N개의 로그 조회
    getRecentLogs(count = 10) {
        return this.logger.getRecentLogs(count);
    }

    // 특정 타입의 토너먼트 로그 조회
    getTournamentTypeLogs(type) {
        return this.logger.getTournamentTypeLogs(type);
    }

    // 로그 통계 조회
    getLogStats(playerName) {
        return this.logger.getLogStats(playerName);
    }

    // 토너먼트 통계 리셋
    resetStats() {
        this.logger.resetStats();
    }

    // 파이널 테이블 결과 확인
    getFinalTableResult(character, initialResult) {
        // 상금 계산
        const prize = this.calculatePrize(initialResult.rank, this.type);

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
                this.prizeSystem.calculateITMBonus(
                    finalResult.rank,
                    this.maxPlayers
                );
            character.modifyResource("reputation", reputationGain);
        }

        // 결과 기록
        this.results.push(finalResult);
        this.logger.addLog(character, finalResult, {
            type: this.type,
            buyIn: this.buyIn,
            prizePool: this.prizePool,
            maxPlayers: this.maxPlayers,
        });

        return {
            success: true,
            result: finalResult,
            finalTable: true,
            message: "파이널 테이블 결과가 확정되었습니다!",
        };
    }

    // 토너먼트 통계 계산
    getStats() {
        const logs = this.logger.getLogs();
        if (!logs || logs.length === 0) {
            return {
                roi: 0,
                itm: 0,
                finalTable: 0,
                victories: 0,
            };
        }

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

        return {
            roi,
            itm,
            finalTable,
            victories,
        };
    }

    generateNPCPlayers(count) {
        const players = [];
        for (let i = 0; i < count; i++) {
            // NPC 기본 능력치를 300-400 사이로 낮춤
            const baseSkill = Math.floor(Math.random() * 100) + 300;

            // 변동폭을 더 크게 설정 (-50 ~ +50)
            const variance = Math.floor(Math.random() * 100) - 50;

            // 최종 능력치 계산 (최소 200, 최대 600)
            const finalSkill = Math.max(
                200,
                Math.min(600, baseSkill + variance)
            );

            players.push({
                id: `npc_${i + 1}`,
                skill: finalSkill,
                isNPC: true,
            });
        }
        return players;
    }

    calculateMatchResult(player1, player2) {
        // 운의 영향력을 약간 증가 (이전 0.2에서 0.3으로)
        const luckFactor = 0.3;

        // 실력 계산에 운 요소 추가
        const player1Performance =
            player1.skill * (1 - luckFactor) +
            Math.random() * 1000 * luckFactor;
        const player2Performance =
            player2.skill * (1 - luckFactor) +
            Math.random() * 1000 * luckFactor;

        return player1Performance > player2Performance ? player1 : player2;
    }
}
