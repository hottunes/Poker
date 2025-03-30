import { Language } from "../i18n/Language";

export class CharacterUI {
    constructor(character) {
        this.character = character;
        this.language = new Language();
        this.container = this.createContainer();

        // 언어 변경 시 UI 업데이트
        this.language.addObserver(() => this.updateUI());

        this.updateUI();
    }

    createContainer() {
        const container = document.createElement("div");
        container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 20px;
            transform: translateY(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: 'system-ui', sans-serif;
            min-width: 250px;
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

        // 스탯 섹션
        const statsSection = document.createElement("div");
        statsSection.style.marginBottom = "20px";

        const statsTitle = document.createElement("div");
        statsTitle.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #4CAF50;
        `;
        statsTitle.textContent = this.language.t("stats.title");
        statsSection.appendChild(statsTitle);

        const stats = this.character.getStats();
        Object.entries(stats).forEach(([stat, value]) => {
            const statContainer = document.createElement("div");
            statContainer.style.cssText = `
                margin-bottom: 10px;
                cursor: help;
            `;
            statContainer.title = this.language.t(`stats.description.${stat}`);

            const label = document.createElement("div");
            label.style.cssText = `
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
                color: #888;
            `;
            label.innerHTML = `
                <span>${this.language.t(`stats.${stat}`)}</span>
                <span>${value}</span>
            `;
            statContainer.appendChild(label);

            const progressBar = document.createElement("div");
            progressBar.style.cssText = `
                width: 100%;
                height: 4px;
                background: #333;
                border-radius: 2px;
            `;

            const progress = document.createElement("div");
            progress.style.cssText = `
                width: ${value}%;
                height: 100%;
                background: #4CAF50;
                border-radius: 2px;
                transition: width 0.3s ease;
            `;
            progressBar.appendChild(progress);
            statContainer.appendChild(progressBar);

            statsSection.appendChild(statContainer);
        });

        // 자원 섹션
        const resourcesSection = document.createElement("div");

        const resourcesTitle = document.createElement("div");
        resourcesTitle.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #4CAF50;
        `;
        resourcesTitle.textContent = this.language.t("resources.title");
        resourcesSection.appendChild(resourcesTitle);

        const resources = this.character.getResources();
        Object.entries(resources).forEach(([resource, value]) => {
            const resourceContainer = document.createElement("div");
            resourceContainer.style.marginBottom = "10px";

            const label = document.createElement("div");
            label.style.cssText = `
                display: flex;
                justify-content: space-between;
                color: #888;
            `;
            label.innerHTML = `
                <span>${this.language.t(`resources.${resource}`)}</span>
                <span>${value.toLocaleString()}</span>
            `;
            resourceContainer.appendChild(label);

            resourcesSection.appendChild(resourceContainer);
        });

        this.container.appendChild(statsSection);
        this.container.appendChild(resourcesSection);
    }
}
