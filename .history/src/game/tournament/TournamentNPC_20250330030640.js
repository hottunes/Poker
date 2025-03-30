export class TournamentNPC {
    constructor(type) {
        this.type = type;
    }

    generateNPCPlayers(count) {
        const players = [];

        for (let i = 0; i < count; i++) {
            // NPC 기본 능력치 (정규 분포에 가깝게 생성, 더 낮은 범위)
            const baseSkill = Math.floor(
                (Math.random() + Math.random() + Math.random()) * 80 + 100
            );

            // 변동폭 (-30 ~ +30, 정규 분포)
            const variance = Math.floor(
                (Math.random() + Math.random() - 1) * 30
            );

            // 최종 능력치 (70-300)
            const finalSkill = Math.max(
                70,
                Math.min(300, baseSkill + variance)
            );

            players.push({
                id: `npc_${i + 1}`,
                skill: finalSkill,
                isNPC: true,
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

    generateNPCScore() {
        // NPC 기본 능력치를 매우 낮게 설정 (0.1-0.2)
        let baseSkill;
        switch (this.type) {
            case "online":
                baseSkill = 0.1; // 온라인: 매우 낮은 실력
                break;
            case "major":
                baseSkill = 0.2; // 메이저: 낮은 실력
                break;
            default:
                baseSkill = 0.15; // 일반: 매우 낮은-낮은 실력
        }

        // 변동성 추가 (±15%)
        const skillVariation = Math.random() * 0.3 - 0.15;
        const skill = Math.max(0, Math.min(1, baseSkill + skillVariation));

        const luck = Math.random();

        // 실력과 운의 비율을 30:70으로 설정 (운의 영향력 더욱 증가)
        return 0.3 * skill + 0.7 * luck;
    }

    generateNPCResults(maxPlayers) {
        const npcResults = [];

        // NPC 수만큼 결과 생성
        for (let i = 0; i < maxPlayers - 1; i++) {
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

        return npcResults;
    }
}
