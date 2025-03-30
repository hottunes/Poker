export class Character {
    constructor(name, style) {
        this.name = name;
        this.style = style;

        // Initialize base stats (0-999 range)
        this.stats = {
            stamina: 500, // 장시간 플레이를 버티는 신체적 능력
            mentalFocus: 500, // 집중력과 감정 조절을 통합한 심리적 능력
            strategy: 500, // GTO와 포커 기술의 조합
            insight: 500, // 상대를 읽고 심리전을 펼치는 능력
            analysis: 500, // 확률과 계산 능력, 리스크와 보상 판단
        };

        // Initialize resources
        this.resources = {
            bankroll: 10000, // 초기 자금
            reputation: 0, // 명성
            energy: 100, // 에너지
        };

        // 옵저버 초기화
        this.observers = [];

        // Load stats from URL parameters if available
        this.loadFromURL();
    }

    // 옵저버 추가
    addObserver(callback) {
        this.observers.push(callback);
    }

    // 옵저버 알림
    notifyObservers() {
        this.observers.forEach((callback) => callback());
    }

    loadFromURL() {
        const urlParams = new URLSearchParams(window.location.search);

        // Load stats from URL
        Object.keys(this.stats).forEach((stat) => {
            const value = urlParams.get(stat);
            if (value) {
                this.stats[stat] = Math.min(999, Math.max(0, parseInt(value)));
            }
        });

        // Load resources from URL
        Object.keys(this.resources).forEach((resource) => {
            const value = urlParams.get(resource);
            if (value) {
                this.resources[resource] = parseInt(value);
            }
        });
    }

    // 스탯 수정 메서드
    modifyStat(stat, amount) {
        if (this.stats[stat] !== undefined) {
            this.stats[stat] = Math.min(
                999,
                Math.max(0, this.stats[stat] + amount)
            );
            this.notifyObservers();
            return true;
        }
        return false;
    }

    // 자원 수정 메서드
    modifyResource(resource, amount) {
        if (this.resources[resource] !== undefined) {
            this.resources[resource] += amount;
            this.notifyObservers();
            return true;
        }
        return false;
    }

    // 스탯 정보 반환
    getStats() {
        return { ...this.stats };
    }

    // 자원 정보 반환
    getResources() {
        return { ...this.resources };
    }

    // 전체 캐릭터 정보 반환
    getCharacterInfo() {
        return {
            name: this.name,
            style: this.style,
            stats: this.getStats(),
            resources: this.getResources(),
        };
    }

    calculateScore(character) {
        const skill = this.calculateSkill(character);
        const luck = Math.random(); // 순수 운 (0~1)
        return 0.6 * skill + 0.4 * luck; // 실력 60%, 운 40%
    }

    calculateRank(playerScore) {
        // 모든 결과의 점수를 배열로 만들고 플레이어 점수 추가
        const scores = [...this.results.map((r) => r.score), playerScore];
        // 점수 내림차순 정렬
        scores.sort((a, b) => b - a);
        // 플레이어 점수의 순위 찾기 (1-based index)
        return scores.indexOf(playerScore) + 1;
    }

    generateNPCResults() {
        this.results = Array.from({ length: this.maxPlayers - 1 }, (_, i) => ({
            character: { name: `NPC ${i + 1}` },
            score: this.scoreSystem.generateNPCScore(),
            rank: 0,
            prize: 0,
        }));
    }
}
