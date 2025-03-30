import { TournamentPrize } from "../systems/prize/TournamentPrize.js";
import { TournamentScore } from "../systems/score/TournamentScore.js";
import { TournamentLogger } from "../systems/logger/TournamentLogger.js";

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
        this.prizeSystem = new TournamentPrize(this);
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

    enter(character) {
        if (!this.canEnter(character)) {
            return {
                success: false,
                message: "참가 조건을 만족하지 않습니다.",
            };
        }

        const result = this.calculateInitialResult(character);

        if (result.rank <= 9) {
            return {
                success: true,
                finalTable: true,
                result,
            };
        }

        this.logger.logResult(result);
        return {
            success: true,
            finalTable: false,
            result,
        };
    }

    canEnter(character) {
        return character.money >= this.buyIn;
    }

    calculateInitialResult(character) {
        return this.scoreSystem.calculateResult(character, this.type);
    }

    getFinalTableResult(initialResults) {
        const finalResults =
            this.scoreSystem.calculateFinalTableResults(initialResults);
        finalResults.forEach((result) => {
            result.prize = this.prizeSystem.calculatePrize(result.rank);
            this.logger.logResult(result);
        });
        return finalResults;
    }

    getLogs() {
        return this.logger.getLogs();
    }

    getLogStats() {
        return this.logger.getStats();
    }

    resetStats() {
        this.logger.resetLogs();
    }
}
