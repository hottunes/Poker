import { TournamentPrize } from "./TournamentPrize.js";
import { TournamentLogger } from "./TournamentLogger.js";
import { TournamentStats } from "./TournamentStats.js";
import { TournamentNPC } from "./TournamentNPC.js";
import { TournamentMatch } from "./TournamentMatch.js";

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
        this.logger = new TournamentLogger();
        this.statsSystem = new TournamentStats(this.logger, this.buyIn);
        this.npcSystem = new TournamentNPC(this.type);
        this.matchSystem = new TournamentMatch();
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
        // 참가비 확인
        if (character.funds < this.buyIn) {
            return {
                success: false,
                message: "참가비가 부족합니다.",
            };
        }

        // 참가비 지불
        character.modifyResource("bankroll", -this.buyIn);

        // 초기 결과 계산
        const result = this.calculateInitialResult(character);

        // 파이널 테이블 진출 여부 확인 (9등 이내)
        const isFinalTable = result.rank <= 9;

        return {
            success: true,
            finalTable: isFinalTable,
            result: result,
        };
    }

    // 토너먼트 결과 계산
    calculateInitialResult(character) {
        // NPC 결과 생성
        this.results = this.npcSystem.generateNPCResults(this.maxPlayers);

        // 플레이어 점수 계산
        const playerScore = this.matchSystem.calculateScore(character);

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
        const prize = this.calculatePrize(rank, this.maxPlayers);

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

    // 순위별 상금 계산
    calculatePrize(rank, totalPlayers) {
        // 참가자 수에 따라 ITM 비율 조정
        const itmRatio = totalPlayers < 100 ? 0.2 : 0.15;
        const itmCount = Math.floor(totalPlayers * itmRatio);

        if (rank > itmCount) return 0;

        // 순위별 상금 비율 (1등: 30%, 2등: 20%, 3등: 15%, 나머지: 35% 균등 분배)
        let prizeRatio;
        switch (rank) {
            case 1:
                prizeRatio = 0.3;
                break;
            case 2:
                prizeRatio = 0.2;
                break;
            case 3:
                prizeRatio = 0.15;
                break;
            default:
                // 남은 35%를 4등부터 ITM까지 균등 분배
                prizeRatio = 0.35 / (itmCount - 3);
        }

        return Math.floor(this.prizePool * prizeRatio);
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
        this.statsSystem.resetStats();
    }

    // 토너먼트 통계 계산
    getStats() {
        return this.statsSystem.getStats();
    }

    // 파이널 테이블 결과 확인
    getFinalTableResult(character, initialResult) {
        // 상금 계산
        const prize = this.calculatePrize(initialResult.rank, this.maxPlayers);

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
}
