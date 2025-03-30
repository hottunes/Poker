export class TournamentMatch {
    constructor() {
        this.luckFactor = 0.6; // 운의 영향력 (60%)
    }

    calculateSkill(character) {
        // 기본값 설정
        const defaultSkill = 500;

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

    calculateScore(character) {
        const skill = this.calculateSkill(character) / 1000; // 0-1 스케일로 정규화
        const luck = Math.random(); // 순수 운 (0~1)

        // 실력과 운의 비율을 40:60으로 설정
        return 0.4 * skill + 0.6 * luck;
    }

    calculateMatchResult(player1, player2) {
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
            player1Skill * (1 - this.luckFactor) +
            player1Luck * 1000 * this.luckFactor;
        const player2Performance =
            player2Skill * (1 - this.luckFactor) +
            player2Luck * 1000 * this.luckFactor;

        return player1Performance > player2Performance ? player1 : player2;
    }

    calculateRank(playerScore, scores) {
        // 모든 결과의 점수를 배열로 만들고 플레이어 점수 추가
        const allScores = [...scores, playerScore];

        // 점수 내림차순 정렬
        allScores.sort((a, b) => b - a);

        // 플레이어 점수의 순위 찾기 (1-based index)
        return allScores.indexOf(playerScore) + 1;
    }
}
