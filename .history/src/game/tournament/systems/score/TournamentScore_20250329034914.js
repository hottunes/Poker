export class TournamentScore {
    constructor() {
        this.weights = {
            strategy: 0.3, // 전략: 30%
            analysis: 0.25, // 분석력: 25% (기존 20%에서 증가)
            insight: 0.2, // 통찰력: 20% (기존 25%에서 감소)
            mentalFocus: 0.15, // 정신 집중력: 15%
            stamina: 0.1, // 체력: 10%
        };
    }

    // 스탯을 정규화하고 가중치를 적용하여 실력 점수 계산 (0~1 범위)
    calculateSkill(character) {
        return Object.entries(this.weights).reduce((total, [stat, weight]) => {
            return total + character.stats[stat] * weight;
        }, 0);
    }

    // 실력과 운을 결합하여 최종 퍼포먼스 점수 계산
    calculateScore(character) {
        const skill = this.calculateSkill(character);
        const luck = Math.random(); // 순수 운 (0~1)
        return 0.6 * skill + 0.4 * luck; // 실력 60%, 운 40%
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

    // 순위 계산
    calculateRank(playerScore, scores) {
        // 점수 내림차순 정렬
        const sortedScores = [...scores, playerScore].sort((a, b) => b - a);
        // 플레이어 점수의 순위 찾기 (1-based index)
        return sortedScores.indexOf(playerScore) + 1;
    }
}
