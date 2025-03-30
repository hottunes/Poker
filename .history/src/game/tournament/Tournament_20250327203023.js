export class Tournament {
    constructor(name, buyIn, prizePool, maxPlayers, type) {
        this.name = name;
        this.buyIn = buyIn;
        this.prizePool = prizePool;
        this.maxPlayers = maxPlayers;
        this.type = type; // 'local', 'online', 'major'
        this.currentPlayers = 0;
        this.status = "open"; // 'open', 'in_progress', 'completed'
        this.players = [];
        this.results = [];
    }

    // 토너먼트 참가 가능 여부 확인
    canEnter(character) {
        return (
            this.status === "open" &&
            this.currentPlayers < this.maxPlayers &&
            character.resources.bankroll >= this.buyIn &&
            character.resources.energy >= 20
        );
    }

    // 토너먼트 참가
    enter(character, strategy) {
        if (!this.canEnter(character)) {
            return {
                success: false,
                message: "토너먼트 참가가 불가능합니다.",
            };
        }

        // 참가비 지불
        character.modifyResource("bankroll", -this.buyIn);
        character.modifyResource("energy", -20);

        // 플레이어 등록
        this.players.push({
            character,
            strategy,
            score: 0,
        });
        this.currentPlayers++;

        // 결과 계산
        const result = this.calculateResult(character, strategy);
        this.results.push(result);

        return {
            success: true,
            result,
        };
    }

    // 결과 계산
    calculateResult(character, strategy) {
        const score = character.calculateTournamentResult(strategy);
        const rank = this.calculateRank(score);
        const prize = this.calculatePrize(rank);

        return {
            character,
            strategy,
            score,
            rank,
            prize,
        };
    }

    // 순위 계산
    calculateRank(score) {
        const sortedScores = [...this.results]
            .map((r) => r.score)
            .sort((a, b) => b - a);

        const rank = sortedScores.indexOf(score) + 1;
        return rank;
    }

    // 상금 계산
    calculatePrize(rank) {
        const prizeDistribution = {
            1: 0.4, // 1등 40%
            2: 0.25, // 2등 25%
            3: 0.15, // 3등 15%
            4: 0.1, // 4등 10%
            5: 0.1, // 5등 10%
        };

        return Math.floor(this.prizePool * (prizeDistribution[rank] || 0));
    }

    // 토너먼트 정보 반환
    getInfo() {
        return {
            name: this.name,
            buyIn: this.buyIn,
            prizePool: this.prizePool,
            maxPlayers: this.maxPlayers,
            currentPlayers: this.currentPlayers,
            type: this.type,
            status: this.status,
        };
    }

    // 결과 정보 반환
    getResults() {
        return [...this.results].sort((a, b) => a.rank - b.rank);
    }
}
