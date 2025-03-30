export class CharacterUI {
    constructor(character) {
        this.character = character;
        this.container = this.createContainer();
        this.updateUI();
    }

    createContainer() {
        const container = document.createElement("div");
        container.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: 'system-ui', sans-serif;
            z-index: 1000;
        `;
        document.body.appendChild(container);
        return container;
    }

    createStatBar(stat, value) {
        const statContainer = document.createElement("div");
        statContainer.style.marginBottom = "10px";

        const label = document.createElement("div");
        label.style.display = "flex";
        label.style.justifyContent = "space-between";
        label.style.marginBottom = "5px";

        const name = document.createElement("span");
        name.textContent = this.formatStatName(stat);

        const valueText = document.createElement("span");
        valueText.textContent = value;

        label.appendChild(name);
        label.appendChild(valueText);

        const bar = document.createElement("div");
        bar.style.cssText = `
            width: 200px;
            height: 10px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 5px;
            overflow: hidden;
        `;

        const fill = document.createElement("div");
        fill.style.cssText = `
            width: ${value}%;
            height: 100%;
            background: #4CAF50;
            transition: width 0.3s ease;
        `;

        bar.appendChild(fill);
        statContainer.appendChild(label);
        statContainer.appendChild(bar);

        return statContainer;
    }

    formatStatName(stat) {
        const names = {
            pokerIQ: "포커 IQ",
            insight: "통찰력",
            gtoMastery: "GTO 마스터리",
            focus: "집중력",
            stamina: "체력",
            luck: "운",
            bankroll: "자금",
            reputation: "명성",
            energy: "에너지",
        };
        return names[stat] || stat;
    }

    updateUI() {
        this.container.innerHTML = "";

        // 캐릭터 이름과 스타일 표시
        const header = document.createElement("div");
        header.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #4CAF50;
        `;
        header.textContent = `${this.character.name} (${this.character.style})`;
        this.container.appendChild(header);

        // 스탯 바 표시
        Object.entries(this.character.getStats()).forEach(([stat, value]) => {
            this.container.appendChild(this.createStatBar(stat, value));
        });

        // 자원 정보 표시
        const resources = document.createElement("div");
        resources.style.marginTop = "15px";
        resources.style.paddingTop = "15px";
        resources.style.borderTop = "1px solid rgba(255, 255, 255, 0.2)";

        Object.entries(this.character.getResources()).forEach(
            ([resource, value]) => {
                resources.appendChild(this.createStatBar(resource, value));
            }
        );

        this.container.appendChild(resources);
    }
}
