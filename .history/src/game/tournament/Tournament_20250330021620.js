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
        // 참가비 확인
        if (character.funds < this.buyIn) {
            return {
                success: false,
                message: "참가비가 부족합니다.",
            };
        }

        // 참가비 지불
        character.modifyResource("bankroll", -this.buyIn);

        // NPC 플레이어 생성
        const players = this.generateNPCPlayers(this.maxPlayers - 1);
        players.push({
            id: "player",
            skill: this.calculateSkill(character),
            isNPC: false,
        });

        // 토너먼트 진행
        let remainingPlayers = players;
        let playerRank = this.maxPlayers;
        let isPlayerEliminated = false;

        while (remainingPlayers.length > 1 && !isPlayerEliminated) {
            const matchResults = [];

            // 매치 진행
            for (let i = 0; i < remainingPlayers.length - 1; i += 2) {
                const winner = this.calculateMatchResult(
                    remainingPlayers[i],
                    remainingPlayers[i + 1]
                );
                matchResults.push(winner);

                // 플레이어가 탈락한 경우
                if (
                    !winner.isNPC === false &&
                    (remainingPlayers[i].isNPC === false ||
                        remainingPlayers[i + 1].isNPC === false)
                ) {
                    isPlayerEliminated = true;
                    playerRank = remainingPlayers.length;
                }
            }

            // 홀수인 경우 마지막 플레이어 자동 진출
            if (remainingPlayers.length % 2 === 1) {
                matchResults.push(
                    remainingPlayers[remainingPlayers.length - 1]
                );
            }

            remainingPlayers = matchResults;
        }

        // 상금 계산
        const prize = this.calculatePrize(playerRank, this.maxPlayers);

        // 결과 반환
        const result = {
            rank: playerRank,
            prize: prize,
        };

        // 파이널 테이블 진출 여부 확인 (4위 이내)
        const isFinalTable = playerRank <= 4;

        return {
            success: true,
            finalTable: isFinalTable,
            result: result,
        };
    }

    // 스탯을 정규화하고 가중치를 적용하여 실력 점수 계산 (0~1 범위)
    calculateSkill(character) {
        // 기본값 설정
        const defaultSkill = 500; // 기본 스킬값

        // character나 resources가 undefined인 경우 기본값 반환
        if (!character || !character.resources) {
            return defaultSkill;
        }

        const resources = character.resources;
        const weights = {
            strategy: 0.3,
            analysis: 0.3,
            aggressive: 0.2,
            defensive: 0.2,
        };

        // 각 능력치에 대해 기본값 0 사용
        const strategy = resources.strategy || 0;
        const analysis = resources.analysis || 0;
        const aggressive = resources.aggressive || 0;
        const defensive = resources.defensive || 0;

        // 가중 평균 계산
        const weightedSkill =
            strategy * weights.strategy +
            analysis * weights.analysis +
            aggressive * weights.aggressive +
            defensive * weights.defensive;

        // 최소 100, 최대 1000으로 제한
        return Math.max(100, Math.min(1000, weightedSkill));
    }

    // 실력과 운을 결합하여 최종 퍼포먼스 점수 계산
    calculateScore(character) {
        const skill = this.calculateSkill(character) / 1000; // 0-1 스케일로 정규화
        const luck = Math.random(); // 순수 운 (0~1)

        // 실력과 운의 비율을 40:60으로 설정
        return 0.4 * skill + 0.6 * luck;
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
        // NPC 기본 능력치를 낮게 설정 (0.2-0.3)
        let baseSkill;
        switch (this.type) {
            case "online":
                baseSkill = 0.2; // 온라인: 낮은 실력
                break;
            case "major":
                baseSkill = 0.3; // 메이저: 평균 실력
                break;
            default:
                baseSkill = 0.25; // 일반: 낮은-평균 실력
        }

        // 변동성 추가 (±20%)
        const skillVariation = Math.random() * 0.4 - 0.2;
        const skill = Math.max(0, Math.min(1, baseSkill + skillVariation));

        const luck = Math.random();

        // 실력과 운의 비율을 40:60으로 설정 (운의 영향력 증가)
        return 0.4 * skill + 0.6 * luck;
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

    // NPC 플레이어 생성
    generateNPCPlayers(count) {
        const players = [];

        // 실제 참가자 수를 랜덤하게 결정 (최대 인원의 70-100%)
        const actualCount = Math.floor(
            Math.random() * (count * 0.3) + count * 0.7
        );

        for (let i = 0; i < actualCount; i++) {
            // NPC 기본 능력치 (정규 분포에 가깝게 생성)
            const baseSkill = Math.floor(
                (Math.random() + Math.random() + Math.random()) * 100 + 150
            );

            // 변동폭 (-50 ~ +50, 정규 분포)
            const variance = Math.floor(
                (Math.random() + Math.random() - 1) * 50
            );

            // 최종 능력치 (100-400)
            const finalSkill = Math.max(
                100,
                Math.min(400, baseSkill + variance)
            );

            players.push({
                id: `npc_${i + 1}`,
                skill: finalSkill,
                isNPC: true,
                // 각 NPC마다 고유한 운 요소 추가
                luckFactor: Math.random(),
            });
        }

        // NPC 순서를 랜덤하게 섞기
        for (let i = players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [players[i], players[j]] = [players[j], players[i]];
        }

        return players;
    }

    calculateMatchResult(player1, player2) {
        const luckFactor = 0.6;

        // 각 플레이어의 운 요소 계산
        const player1Luck = player1.isNPC ? player1.luckFactor : Math.random();
        const player2Luck = player2.isNPC ? player2.luckFactor : Math.random();

        // 실력 점수 계산
        const player1Skill = player1.isNPC
            ? player1.skill
            : this.calculateSkill(player1);
        const player2Skill = player2.isNPC
            ? player2.skill
            : this.calculateSkill(player2);

        // 최종 성과 계산 (실력 40% + 운 60%)
        const player1Performance =
            player1Skill * (1 - luckFactor) + player1Luck * 1000 * luckFactor;
        const player2Performance =
            player2Skill * (1 - luckFactor) + player2Luck * 1000 * luckFactor;

        return player1Performance > player2Performance ? player1 : player2;
    }
}
