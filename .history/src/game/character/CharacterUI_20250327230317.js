import { Language } from "../i18n/Language";

export class CharacterUI {
    constructor(character) {
        this.character = character;
        this.container = this.createContainer();
        this.language = new Language();

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

    createStatBar(name, value, max = 100) {
        const container = document.createElement("div");
        container.style.marginBottom = "10px";

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

        const bar = document.createElement("div");
        bar.style.cssText = `
            width: 100%;
            height: 10px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
            overflow: hidden;
        `;

        const fill = document.createElement("div");
        fill.style.cssText = `
            width: ${(value / max) * 100}%;
            height: 100%;
            background: #4CAF50;
            border-radius: 5px;
        `;

        bar.appendChild(fill);
        container.appendChild(label);
        container.appendChild(bar);

        return container;
    }

    createResourceBar(name, value) {
        const container = document.createElement("div");
        container.style.marginBottom = "10px";

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

        const bar = document.createElement("div");
        bar.style.cssText = `
            width: 100%;
            height: 10px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
            overflow: hidden;
        `;

        const fill = document.createElement("div");
        fill.style.cssText = `
            width: 100%;
            height: 100%;
            background: #4CAF50;
            border-radius: 5px;
        `;

        bar.appendChild(fill);
        container.appendChild(label);
        container.appendChild(bar);

        return container;
    }

    updateUI() {
        this.container.innerHTML = "";

        // 스탯 표시
        const stats = this.character.getStats();
        Object.entries(stats).forEach(([name, value]) => {
            this.container.appendChild(this.createStatBar(name, value));
        });

        // 자원 표시
        const resources = this.character.getResources();
        Object.entries(resources).forEach(([name, value]) => {
            this.container.appendChild(this.createResourceBar(name, value));
        });
    }
}
