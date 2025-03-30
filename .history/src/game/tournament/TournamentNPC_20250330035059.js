export class TournamentNPC {
    constructor(type) {
        this.type = type;
    }

    generateNPCPlayers(count) {
        const npcs = [];
        for (let i = 0; i < count; i++) {
            const npc = {
                isNPC: true,
                skill: this.generateNPCSkill(),
                luckFactor: Math.random(),
            };
            npcs.push(npc);
        }
        return npcs;
    }

    generateNPCSkill() {
        // 토너먼트 타입에 따른 기본 스킬 범위 설정
        let baseSkill;
        switch (this.type) {
            case "online":
                // 온라인 스페셜의 난이도 중간으로 조정 (175-375)
                baseSkill = 175 + Math.random() * 200;
                break;
            case "highroller":
                // 하이롤러는 중간 난이도 (250-450)
                baseSkill = 250 + Math.random() * 200;
                break;
            default:
                baseSkill = 175 + Math.random() * 200;
        }

        // 스킬 변동성 추가 (-20 ~ +20)
        const variation = (Math.random() - 0.5) * 40;

        // 최종 스킬 계산 및 범위 제한 (100-1000)
        return Math.max(100, Math.min(1000, baseSkill + variation));
    }

    generateNPCResults(count) {
        const npcs = this.generateNPCPlayers(count - 1); // 플레이어 한 명을 제외한 NPC 생성
        const results = [];

        for (let i = 0; i < npcs.length; i++) {
            const npc = npcs[i];
            results.push({
                isNPC: true,
                rank: i + 1,
                score: (npc.skill / 1000) * 0.5 + npc.luckFactor * 0.5, // 스킬 50% + 운 50%
            });
        }

        return results;
    }
}
