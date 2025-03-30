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

    // 상금 계산
    calculatePrize(rank, isFinalTable = false) {
        return this.prizeSystem.calculatePrize(rank, this.prizePool, this.type);
    }

    // 상금 지급 및 결과 기록
    awardPrize(character, result, prize, isFinalTable = false) {
        // 결과 객체 생성
        const finalResult = {
            character: character,
            rank: result.rank,
            prize: prize,
            isInMoney: this.prizeSystem.isInMoney(result.rank, this.type),
            isFinalTable: isFinalTable,
            score: result.score,
            prizePool: this.prizePool,
            type: this.type,
            totalPlayers: this.maxPlayers,
        };

        // 상금 지급
        if (prize > 0) {
            character.modifyResource("bankroll", prize);
        }

        // 결과 기록
        this.results.push(finalResult);
        this.logger.addLog(character, finalResult, {
            type: this.type,
            buyIn: this.buyIn,
            prizePool: this.prizePool,
            maxPlayers: this.maxPlayers,
        });

        return finalResult;
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

        // 파이널 테이블 진출하지 않은 경우에만 여기서 상금 지급
        if (!result.isFinalTable) {
            const prize = this.calculatePrize(result.rank, false);
            const finalResult = this.awardPrize(
                character,
                result,
                prize,
                false
            );
            return {
                success: true,
                finalTable: false,
                result: finalResult,
            };
        }

        // 파이널 테이블 진출한 경우
        return {
            success: true,
            finalTable: true,
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

        // 파이널 테이블 진출 여부
        const isFinalTable = rank <= 9;

        return {
            rank,
            score: playerScore,
            isInMoney: this.prizeSystem.isInMoney(rank, this.type),
            isFinalTable,
            totalPlayers: this.maxPlayers,
            character,
        };
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
        if (!initialResult.isFinalTable) {
            return {
                success: false,
                message: "파이널 테이블 진출자가 아닙니다.",
            };
        }

        // 상금 계산 및 지급
        const prize = this.calculatePrize(initialResult.rank, true);
        const finalResult = this.awardPrize(
            character,
            initialResult,
            prize,
            true
        );

        return {
            success: true,
            result: {
                ...finalResult,
                character: {
                    name: character.name,
                    resources: character.resources,
                },
            },
            finalTable: true,
            message: "파이널 테이블 결과가 확정되었습니다!",
        };
    }
}
