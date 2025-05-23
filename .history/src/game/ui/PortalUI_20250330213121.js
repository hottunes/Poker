export class PortalUI {
    constructor(game) {
        this.game = game;
        this.language = game.language;
        this.container = this.createPortalContainer();
        this.isEntrance = false;
        this.referringGame = null;

        // URL 파라미터 체크
        const params = new URLSearchParams(window.location.search);
        const isFromPortal = params.get("portal") === "true";
        const refGame = params.get("ref");

        if (isFromPortal && refGame) {
            this.isEntrance = true;
            this.referringGame = refGame;
        }

        this.createPortal();

        // 언어 변경 이벤트 리스너 추가
        document.addEventListener("languageChanged", () => {
            this.updatePortalText();
        });
    }

    createPortalContainer() {
        const container = document.createElement("div");
        container.style.cssText = `
            position: fixed;
            right: 32px;
            top: calc(50% + 200px);  // 토너먼트 UI 아래로 이동
            transform: translateY(-50%);
            z-index: 9999;
            pointer-events: auto;
        `;
        return container;
    }

    updatePortalText() {
        const mainText = this.container.querySelector(".portal-main-text");
        const subText = this.container.querySelector(".portal-sub-text");

        if (mainText && subText) {
            mainText.textContent = this.isEntrance
                ? this.language.t("portal.returnToPrevious")
                : this.language.t("portal.title");
            subText.textContent = this.isEntrance
                ? this.language.t("portal.clickToReturn")
                : this.language.t("portal.clickToNext");
        }
    }

    createPortal() {
        const portalButton = document.createElement("button");
        portalButton.style.cssText = `
            position: relative;
            padding: 16px 24px;
            background: rgba(0, 0, 0, 0.8);
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s;
            overflow: hidden;
            min-width: 200px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;

        // 그라데이션 배경 효과
        const gradient = document.createElement("div");
        gradient.style.cssText = `
            position: absolute;
            inset: 0;
            background: linear-gradient(to right, #8B5CF6, #EC4899);
            opacity: 0.2;
            transition: opacity 0.3s;
            border-radius: 12px;
        `;
        portalButton.appendChild(gradient);

        // 텍스트 컨테이너
        const textContainer = document.createElement("div");
        textContainer.style.cssText = `
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 4px 0;
        `;

        // 메인 텍스트
        const mainText = document.createElement("span");
        mainText.className = "portal-main-text";
        mainText.style.cssText = `
            color: #A78BFA;
            font-size: 18px;
            font-weight: bold;
            transition: color 0.3s;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        `;

        // 서브 텍스트
        const subText = document.createElement("span");
        subText.className = "portal-sub-text";
        subText.style.cssText = `
            color: #9CA3AF;
            font-size: 14px;
            transition: color 0.3s;
        `;

        textContainer.appendChild(mainText);
        textContainer.appendChild(subText);
        portalButton.appendChild(textContainer);

        // 초기 텍스트 설정
        mainText.textContent = this.isEntrance
            ? this.language.t("portal.returnToPrevious")
            : this.language.t("portal.title");
        subText.textContent = this.isEntrance
            ? this.language.t("portal.clickToReturn")
            : this.language.t("portal.clickToNext");

        // 호버 효과
        portalButton.onmouseover = () => {
            gradient.style.opacity = "0.4";
            mainText.style.color = "#F3F4F6";
            subText.style.color = "#D1D5DB";
        };
        portalButton.onmouseout = () => {
            gradient.style.opacity = "0.2";
            mainText.style.color = "#A78BFA";
            subText.style.color = "#9CA3AF";
        };

        // 클릭 이벤트
        portalButton.onclick = () => this.handlePortalClick();

        this.container.appendChild(portalButton);
    }

    handlePortalClick() {
        const params = new URLSearchParams();

        // 기본 파라미터
        params.append("portal", "true");
        params.append("username", this.game.character?.nickname || "player");
        params.append("color", "white");
        params.append("speed", "1");

        // 현재 게임의 URL을 ref로 추가
        params.append("ref", window.location.href);

        // 포털을 통해 들어온 경우, 이전 게임으로 돌아가기
        if (this.isEntrance && this.referringGame) {
            window.location.href = this.referringGame;
            return;
        }

        // 다음 게임으로 이동
        const nextPage = `http://portal.pieter.com/?${params.toString()}`;
        window.location.href = nextPage;
    }
}
