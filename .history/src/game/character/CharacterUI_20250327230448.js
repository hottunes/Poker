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
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: 'system-ui', sans-serif;
            min-width: 200px;
        `;
        document.body.appendChild(container);
        return container;
    }

    createStatBar(name, value, color = "#4CAF50") {
        const bar = document.createElement("div");
        bar.style.marginBottom = "10px";

        const label = document.createElement("div");
        label.style.display = "flex";
        label.style.justifyContent = "space-between";
        label.style.marginBottom = "5px";

        const nameSpan = document.createElement("span");
        nameSpan.textContent = this.language.t(`stats.${name}`);

        const valueSpan = document.createElement("span");
        valueSpan.textContent = value;

        label.appendChild(nameSpan);
        label.appendChild(valueSpan);

        const progress = document.createElement("div");
        progress.style.cssText = `
            width: 100%;
            height: 5px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            overflow: hidden;
        `;

        const fill = document.createElement("div");
        fill.style.cssText = `
            width: ${value}%;
            height: 100%;
            background: ${color};
            transition: width 0.3s ease;
        `;

        progress.appendChild(fill);
        bar.appendChild(label);
        bar.appendChild(progress);

        return bar;
    }

    createResourceBar(name, value, max = 100, color = "#4CAF50") {
        const bar = document.createElement("div");
        bar.style.marginBottom = "10px";

        const label = document.createElement("div");
        label.style.display = "flex";
        label.style.justifyContent = "space-between";
        label.style.marginBottom = "5px";

        const nameSpan = document.createElement("span");
        nameSpan.textContent = this.language.t(`resources.${name}`);

        const valueSpan = document.createElement("span");
        valueSpan.textContent = value;

        label.appendChild(nameSpan);
        label.appendChild(valueSpan);

        const progress = document.createElement("div");
        progress.style.cssText = `
            width: 100%;
            height: 5px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            overflow: hidden;
        `;

        const percentage = Math.min((value / max) * 100, 100);
        const fill = document.createElement("div");
        fill.style.cssText = `
            width: ${percentage}%;
            height: 100%;
            background: ${color};
            transition: width 0.3s ease;
        `;

        progress.appendChild(fill);
        bar.appendChild(label);
        bar.appendChild(progress);

        return bar;
    }

    updateUI() {
        this.container.innerHTML = "";

        // 스탯 표시
        const stats = this.character.getStats();
        for (const [name, value] of Object.entries(stats)) {
            this.container.appendChild(this.createStatBar(name, value));
        }

        // 구분선
        const divider = document.createElement("div");
        divider.style.cssText = `
            height: 1px;
            background: rgba(255, 255, 255, 0.1);
            margin: 15px 0;
        `;
        this.container.appendChild(divider);

        // 자원 표시
        const resources = this.character.getResources();
        this.container.appendChild(
            this.createResourceBar(
                "bankroll",
                resources.bankroll,
                resources.bankroll
            )
        );
        this.container.appendChild(
            this.createResourceBar("reputation", resources.reputation)
        );
        this.container.appendChild(
            this.createResourceBar("energy", resources.energy)
        );
    }
}
