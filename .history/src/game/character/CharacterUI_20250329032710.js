import { Language } from "../i18n/Language";

export class CharacterUI {
    constructor(character, language) {
        this.character = character;
        this.language = language;
        this.container = null;

        // 언어 변경 시 UI 업데이트
        this.language.addObserver(() => this.updateUI());

        // 캐릭터 상태 변경 시 UI 업데이트
        this.character.addObserver(() => this.updateUI());

        this.updateUI();
    }

    createProfileCard() {
        const card = document.createElement("div");
        card.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(30, 30, 30, 0.95);
            border-radius: 12px;
            padding: 15px;
            width: 250px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 1000;
        `;

        // 프로필 이미지
        const profileImage = document.createElement("div");
        profileImage.style.cssText = `
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #4CAF50;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
            font-weight: bold;
        `;
        // 이름의 첫 글자를 프로필 이미지로 사용
        profileImage.textContent = this.character.name.charAt(0).toUpperCase();

        // 캐릭터 정보
        const info = document.createElement("div");
        info.style.cssText = `
            flex-grow: 1;
            color: white;
        `;

        // 캐릭터 이름
        const name = document.createElement("div");
        name.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        `;
        name.textContent = this.character.name;

        // 정보를 카드에 추가
        info.appendChild(name);
        card.appendChild(profileImage);
        card.appendChild(info);

        return card;
    }

    mount(parentElement) {
        this.container = this.createProfileCard();
        parentElement.appendChild(this.container);
    }

    unmount() {
        if (this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
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
}
