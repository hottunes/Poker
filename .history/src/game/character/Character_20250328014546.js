export class Character {
    constructor(name, style) {
        this.name = name;
        this.style = style;

        // Initialize base stats
        this.stats = {
            stamina: 50, // 장시간 플레이를 버티는 신체적 능력 (0-100)
            mentalFocus: 50, // 집중력과 감정 조절을 통합한 심리적 능력 (0-100)
            strategy: 500, // GTO와 포커 기술의 조합 (0-999)
            insight: 500, // 상대를 읽고 심리전을 펼치는 능력 (0-999)
        };

        // Initialize resources
        this.resources = {
            bankroll: 10000, // 초기 자금
            reputation: 0, // 명성
            energy: 100, // 에너지
        };

        // Load stats from URL parameters if available
        this.loadFromURL();
    }

    loadFromURL() {
        const urlParams = new URLSearchParams(window.location.search);

        // Load stats from URL with different max values
        Object.keys(this.stats).forEach((stat) => {
            const value = urlParams.get(stat);
            if (value) {
                const maxValue =
                    stat === "strategy" || stat === "insight" ? 999 : 100;
                this.stats[stat] = Math.min(
                    maxValue,
                    Math.max(0, parseInt(value))
                );
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
            const maxValue =
                stat === "strategy" || stat === "insight" ? 999 : 100;
            this.stats[stat] = Math.min(
                maxValue,
                Math.max(0, this.stats[stat] + amount)
            );
            return true;
        }
        return false;
    }

    // 자원 수정 메서드
    modifyResource(resource, amount) {
        if (this.resources[resource] !== undefined) {
            this.resources[resource] += amount;
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
}
