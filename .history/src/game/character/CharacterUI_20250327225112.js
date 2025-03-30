import { Language } from "../i18n/Language";

export class CharacterUI {
    constructor(game) {
        this.game = game;
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
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: 'system-ui', sans-serif;
            min-width: 300px;
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

        const character = this.game.character;
        const stats = character.getStats();
        const resources = character.resources;

        // 제목
        const title = document.createElement("div");
        title.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #4CAF50;
            text-align: center;
        `;
        title.textContent = this.language.t("stats.title");
        this.container.appendChild(title);

        // 기본 정보
        const basicInfo = document.createElement("div");
        basicInfo.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
        `;

        const basicStats = [
            { key: "level", value: resources.level },
            { key: "experience", value: `${resources.experience}/100` },
            { key: "reputation", value: resources.reputation },
            { key: "bankroll", value: resources.bankroll },
            { key: "energy", value: `${resources.energy}/100` },
        ];

        basicStats.forEach((stat) => {
            const row = document.createElement("div");
            row.style.cssText = `
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
            `;
            row.innerHTML = `
                <span>${this.language.t(`stats.${stat.key}`)}</span>
                <span style="color: #4CAF50;">${stat.value}</span>
            `;
            basicInfo.appendChild(row);
        });

        this.container.appendChild(basicInfo);

        // 포커 스탯
        const pokerStats = document.createElement("div");
        pokerStats.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 8px;
        `;

        const mainStats = [
            { key: "pokerIQ", value: stats.pokerIQ },
            { key: "insight", value: stats.insight },
            { key: "gtoMastery", value: stats.gtoMastery },
            { key: "focus", value: stats.focus },
            { key: "stamina", value: stats.stamina },
            { key: "luck", value: stats.luck },
        ];

        mainStats.forEach((stat) => {
            const row = document.createElement("div");
            row.style.cssText = `
                margin-bottom: 15px;
                cursor: help;
            `;
            row.title = this.language.t(`statDescriptions.${stat.key}`);

            const label = document.createElement("div");
            label.style.cssText = `
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
            `;
            label.innerHTML = `
                <span>${this.language.t(`stats.${stat.key}`)}</span>
                <span style="color: #4CAF50;">${stat.value}</span>
            `;

            const progressBar = document.createElement("div");
            progressBar.style.cssText = `
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 2px;
            `;

            const progress = document.createElement("div");
            progress.style.cssText = `
                width: ${stat.value}%;
                height: 100%;
                background: #4CAF50;
                border-radius: 2px;
                transition: width 0.3s ease;
            `;

            progressBar.appendChild(progress);
            row.appendChild(label);
            row.appendChild(progressBar);
            pokerStats.appendChild(row);
        });

        this.container.appendChild(pokerStats);
    }
}
