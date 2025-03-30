export class Tournament {
    constructor(name, buyIn, prizePool, maxPlayers, type) {
        this.name = name;
        this.buyIn = buyIn;
        this.prizePool = prizePool;
        this.maxPlayers = maxPlayers;
        this.type = type; // 'local', 'online', 'major'
        this.currentPlayers = Math.floor(maxPlayers * 0.8); // 자동으로 NPC 플레이어 채우기
        this.status = "open"; // 'open', 'in_progress', 'completed'
        this.players = [];
        this.results = [];

        // NPC 플레이어 결과 미리 생성
        this.generateNPCResults();
    }

    generateNPCResults() {
        for (let i = 0; i < this.currentPlayers; i++) {
            const npcScore = this.generateNPCScore();
            this.results.push({
                character: { name: `NPC ${i + 1}` },
                score: npcScore,
                rank: 0,
                prize: 0,
            });
        }
    }

    // 토너먼트 참가 가능 여부 확인
    canEnter(character) {
        const energyRequired = this.type === "online" ? 0 : 20;
        return (
            this.status === "open" &&
            this.currentPlayers < this.maxPlayers &&
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

        // 결과 계산
        const result = this.calculateResult(character);
        this.results.push(result);
        this.currentPlayers++;

        return {
            success: true,
            result,
        };
    }

    // 결과 계산
    calculateResult(character) {
        const score = this.calculateScore(character);
        const totalPlayers = this.currentPlayers + 1;
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

    calculateITMBonus(rank, totalPlayers) {
        const itm = Math.floor(totalPlayers * 0.15); // 상위 15%가 ITM
        if (rank <= itm) {
            if (rank === 1) return 50; // 우승
            if (rank === 2) return 30; // 준우승
            if (rank === 3) return 20; // 3위
            if (rank <= Math.floor(totalPlayers * 0.05)) return 15; // 파이널 테이블
            return 10; // 일반 ITM
        }
        return 0;
    }

    // 점수 계산
    calculateScore(character) {
        const stats = character.getStats();

        // 기본 확률 (15%)을 위한 기준점수 계산
        const baseThreshold = 85; // NPC 점수 범위(0-100)에서 상위 15% 진입선
        const skillBonus =
            (stats.pokerIQ * 0.3 +
                stats.insight * 0.25 +
                stats.gtoMastery * 0.2 +
                stats.focus * 0.15 +
                stats.stamina * 0.05 +
                stats.luck * 0.05) /
            100; // 스킬 보너스를 0-1 사이 값으로 변환

        // 기본 점수 (60-90 사이의 정규분포)
        const baseScore = 75 + (Math.random() * 2 - 1) * 15;

        // 스킬 보너스로 최대 20점까지 추가
        const skillScore = skillBonus * 20;

        // 최종 점수 = 기본 점수 + 스킬 보너스
        const finalScore = baseScore + skillScore;

        // 운 요소 추가 (-5% ~ +5%)
        const luckFactor = (Math.random() * 10 - 5) / 100;
        return finalScore * (1 + luckFactor);
    }

    // NPC 점수 생성
    generateNPCScore() {
        // NPC는 0-100 사이의 균등 분포 점수를 가짐
        return Math.random() * 100;
    }

    // 순위 계산
    calculateRank(score) {
        const sortedScores = [...this.results]
            .map((r) => r.score)
            .sort((a, b) => b - a);

        return sortedScores.findIndex((s) => s < score) + 1;
    }

    // 상금 계산
    calculatePrize(rank) {
        const totalPlayers = this.currentPlayers + 1;
        const itm = Math.floor(totalPlayers * 0.15); // 상위 15%가 ITM

        if (rank > itm) return 0; // ITM 밖은 상금 없음

        // 상금 분배 테이블 (1등부터 ITM까지)
        let prizePercentage;
        if (rank === 1) {
            prizePercentage = 0.2; // 1등 20%
        } else if (rank === 2) {
            prizePercentage = 0.12; // 2등 12%
        } else if (rank === 3) {
            prizePercentage = 0.08; // 3등 8%
        } else if (rank <= Math.floor(totalPlayers * 0.05)) {
            // 파이널 테이블
            prizePercentage = 0.04;
        } else {
            // 나머지 ITM
            const remainingPrize = 0.36; // 36%를 나머지 ITM에게 분배
            const remainingPlayers = itm - Math.floor(totalPlayers * 0.05);
            prizePercentage = remainingPrize / remainingPlayers;
        }

        return Math.floor(this.prizePool * prizePercentage);
    }

    // 토너먼트 정보 반환
    getInfo() {
        const totalPlayers = this.currentPlayers;
        const itmCount = Math.floor(totalPlayers * 0.15);

        return {
            name: this.name,
            buyIn: this.buyIn,
            prizePool: this.prizePool,
            maxPlayers: this.maxPlayers,
            currentPlayers: this.currentPlayers,
            type: this.type,
            status: this.status,
            itmCount: itmCount,
        };
    }

    // 결과 정보 반환
    getResults() {
        return [...this.results].sort((a, b) => a.rank - b.rank);
    }
}
