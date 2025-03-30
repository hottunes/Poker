import { Language } from "../i18n/Language.js";

export class CharacterUI {
    constructor(character, language) {
        this.character = character;
        this.language = language;
        this.container = this.createContainer();
        this.createProfilePanel();
        this.createStatsPanel();

        // 언어 변경 시 UI 업데이트
        this.language.addObserver(() => this.updateUI());

        // 캐릭터 상태 변경 시 UI 업데이트
        this.character.addObserver(() => this.updateUI());

        this.updateUI();
    }

    createContainer() {
        const container = document.createElement("div");
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            z-index: 1000;
        `;
        return container;
    }

    createProfilePanel() {
        const profilePanel = document.createElement("div");
        profilePanel.style.cssText = `
            background: rgba(0, 0, 0, 0.8);
            padding: 15px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 15px;
            min-width: 200px;
        `;

        // 프로필 이미지
        const profileImage = document.createElement("div");
        profileImage.style.cssText = `
            width: 50px;
            height: 50px;
            background: url('assets/images/profile.png') center/cover;
            border-radius: 50%;
            border: 2px solid rgb(76, 175, 80);
        `;

        // 캐릭터 정보
        const infoContainer = document.createElement("div");
        infoContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 5px;
        `;

        // 캐릭터 이름
        const name = document.createElement("div");
        name.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            color: white;
        `;
        name.textContent = this.character.name;

        // 플레이 스타일
        const style = document.createElement("div");
        style.style.cssText = `
            font-size: 14px;
            color: rgb(76, 175, 80);
        `;
        style.textContent = this.language.t(
            `playStyle.${this.character.playStyle}`
        );

        infoContainer.appendChild(name);
        infoContainer.appendChild(style);
        profilePanel.appendChild(profileImage);
        profilePanel.appendChild(infoContainer);
        this.container.appendChild(profilePanel);
    }

    createStatsPanel() {
        const statsPanel = document.createElement("div");
        statsPanel.style.cssText = `
            background: rgba(0, 0, 0, 0.8);
            padding: 15px;
            border-radius: 10px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            min-width: 200px;
        `;

        // 자본금
        const bankroll = document.createElement("div");
        bankroll.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 5px;
        `;
        bankroll.innerHTML = `
            <div style="color: #888; font-size: 12px;">${this.language.t(
                "bankroll"
            )}</div>
            <div style="color: rgb(76, 175, 80); font-size: 16px; font-weight: bold;">
                $${this.character.resources.bankroll.toLocaleString()}
            </div>
        `;

        // 명성
        const reputation = document.createElement("div");
        reputation.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 5px;
        `;
        reputation.innerHTML = `
            <div style="color: #888; font-size: 12px;">${this.language.t(
                "reputation"
            )}</div>
            <div style="color: #FFD700; font-size: 16px; font-weight: bold;">
                ${this.character.resources.reputation}
            </div>
        `;

        statsPanel.appendChild(bankroll);
        statsPanel.appendChild(reputation);
        this.container.appendChild(statsPanel);
    }

    createStatBar(name, value, color = "#4CAF50") {
        const bar = document.createElement("div");
        bar.style.marginBottom = "10px";
        bar.style.position = "relative"; // 툴팁 위치 기준점

        const label = document.createElement("div");
        label.style.display = "flex";
        label.style.justifyContent = "space-between";
        label.style.marginBottom = "5px";
        label.style.cursor = "help"; // 도움말 커서 표시

        const nameSpan = document.createElement("span");
        nameSpan.textContent = this.language.t(`stats.${name}`);

        const valueSpan = document.createElement("span");
        valueSpan.textContent = value;

        label.appendChild(nameSpan);
        label.appendChild(valueSpan);

        // 툴팁 요소 생성
        const tooltip = document.createElement("div");
        tooltip.style.cssText = `
            position: absolute;
            left: -10px;
            top: 30px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            white-space: nowrap;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        tooltip.textContent = this.language.t(`statDescriptions.${name}`);

        // 호버 이벤트 처리
        label.addEventListener("mouseenter", () => {
            tooltip.style.opacity = "1";
        });
        label.addEventListener("mouseleave", () => {
            tooltip.style.opacity = "0";
        });

        const progress = document.createElement("div");
        progress.style.cssText = `
            width: 100%;
            height: 5px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            overflow: hidden;
        `;

        // 999를 최대값으로 사용하여 퍼센트 계산
        const percentage = (value / 999) * 100;
        const fill = document.createElement("div");
        fill.style.cssText = `
            width: ${percentage}%;
            height: 100%;
            background: ${color};
            transition: width 0.3s ease;
        `;

        progress.appendChild(fill);
        bar.appendChild(label);
        bar.appendChild(tooltip);
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

        // 스탯 표시 (지정된 순서로)
        const stats = this.character.getStats();
        const statOrder = [
            "strategy",
            "analysis",
            "insight",
            "mentalFocus",
            "stamina",
        ];

        for (const statName of statOrder) {
            this.container.appendChild(
                this.createStatBar(statName, stats[statName])
            );
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

    update() {
        // 자본금과 명성 업데이트
        const bankrollElement = this.container.querySelector(
            "div:last-child div:first-child div:last-child"
        );
        const reputationElement = this.container.querySelector(
            "div:last-child div:last-child div:last-child"
        );

        if (bankrollElement) {
            bankrollElement.textContent = `$${this.character.resources.bankroll.toLocaleString()}`;
        }
        if (reputationElement) {
            reputationElement.textContent = this.character.resources.reputation;
        }
    }
}
