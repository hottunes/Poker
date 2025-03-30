export class TournamentScore {
    constructor() {
        this.skillWeights = {
            normal: {
                전략: 0.3,
                분석력: 0.2,
                통찰력: 0.2,
                정신집중력: 0.15,
                체력: 0.15,
            },
            highroller: {
                전략: 0.25,
                분석력: 0.25,
                통찰력: 0.2,
                정신집중력: 0.15,
                체력: 0.15,
            },
        };
    }

    calculateResult(character, type) {
        const skillScore = this.calculateSkillScore(character, type);
        const luckScore = Math.random();
        const totalScore = skillScore * 0.7 + luckScore * 0.3;

        const rank = this.calculateRank(totalScore);
        const prize = 0; // Prize will be calculated later if needed

        return {
            characterName: character.name,
            rank,
            prize,
            skillScore,
            luckScore,
            totalScore,
        };
    }

    calculateSkillScore(character, type) {
        const weights = this.skillWeights[type];
        let totalScore = 0;

        totalScore += (character.전략 / 999) * weights.전략;
        totalScore += (character.분석력 / 999) * weights.분석력;
        totalScore += (character.통찰력 / 999) * weights.통찰력;
        totalScore += (character.정신집중력 / 999) * weights.정신집중력;
        totalScore += (character.체력 / 999) * weights.체력;

        return totalScore;
    }

    calculateRank(score) {
        if (score > 0.95) return 1;
        if (score > 0.9) return 2;
        if (score > 0.85) return 3;
        if (score > 0.8) return 4;
        if (score > 0.75) return 5;
        if (score > 0.7) return 6;
        if (score > 0.65) return 7;
        if (score > 0.6) return 8;
        if (score > 0.55) return 9;

        return Math.floor(10 + (1 - score) * 990);
    }

    calculateFinalTableResults(initialResults) {
        return initialResults
            .map((result) => {
                const luckScore = Math.random();
                const totalScore = result.skillScore * 0.7 + luckScore * 0.3;
                return {
                    ...result,
                    luckScore,
                    totalScore,
                };
            })
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((result, index) => ({
                ...result,
                rank: index + 1,
            }));
    }
}
