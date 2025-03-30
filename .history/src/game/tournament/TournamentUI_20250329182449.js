import { Tournament } from "./Tournament";
import { Language } from "../i18n/Language";

export class TournamentUI {
    constructor(game) {
        this.game = game;
        this.language = game.language;
        this.character = game.character;
        this.tournaments = [
            new Tournament("online", 100, 1000),
            new Tournament("highroller", 1000, 200),
        ];
        this.isPendingFinalTable = false;
        this.character.tournament = this.tournaments[0];

        this.initializeUI();
        this.language.addObserver(() => this.updateUI());
    }

    initializeUI() {
        this.container = this.createMainContainer();
        this.languageSelector = this.createLanguageSelector();
        this.updateUI();
    }

    // 메인 컨테이너 생성
    createMainContainer() {
        const container = document.createElement("div");
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: 'system-ui', sans-serif;
            z-index: 1000;
            width: 300px;
        `;
        document.body.appendChild(container);
        return container;
    }

    // 언어 선택기 생성
    createLanguageSelector() {
        const container = document.createElement("div");
        container.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px;
            border-radius: 6px;
            z-index: 1000;
            display: flex;
            align-items: center;
        `;

        const select = this.createLanguageSelect();
        container.appendChild(select);
        document.body.appendChild(container);
        return container;
    }

    createLanguageSelect() {
        const select = document.createElement("select");
        select.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 5px 10px;
            font-size: 14px;
            cursor: pointer;
            outline: none;
            font-family: 'system-ui', sans-serif;
        `;

        const languages = {
            en: "English",
            zh: "中文",
            ja: "日本語",
            ko: "한국어",
        };

        Object.entries(languages).forEach(([code, name]) => {
            const option = document.createElement("option");
            option.value = code;
            option.textContent = name;
            option.selected = this.language.getCurrentLang() === code;
            select.appendChild(option);
        });

        select.onchange = (e) => this.language.setLanguage(e.target.value);
        return select;
    }

    // 토너먼트 카드 생성
    createTournamentCard(tournament) {
        const card = document.createElement("div");
        card.style.cssText = this.styles.tournamentCard;

        const info = tournament.getInfo();

        card.appendChild(this.createTournamentHeader(tournament));
        card.appendChild(this.createTournamentDetails(info));
        card.appendChild(this.createEnterButton(tournament));

        return card;
    }

    createTournamentHeader(tournament) {
        const header = document.createElement("div");
        header.style.cssText = this.styles.tournamentHeader;
        header.textContent = this.language.t(
            `tournamentNames.${tournament.type}`
        );
        return header;
    }

    createTournamentDetails(info) {
        const details = document.createElement("div");
        details.style.fontSize = "14px";
        details.innerHTML = `
            ${this.language.t("buyIn")}: ${info.buyIn} | ${this.language.t(
            "prize"
        )}: ${info.prizePool}<br>
            ${this.language.t("participants")}: ${info.currentPlayers}/${
            info.maxPlayers
        }
        `;
        return details;
    }

    createEnterButton(tournament) {
        const button = document.createElement("button");
        button.style.cssText = this.styles.enterButton(
            this.isPendingFinalTable
        );
        button.textContent = this.language.t("enterButton");
        button.disabled = this.isPendingFinalTable;
        button.onclick = () => this.handleEnterClick(tournament);
        return button;
    }

    // 모달 관련 메서드들
    removeExistingModals() {
        const existingModals = document.querySelectorAll(".tournament-modal");
        existingModals.forEach((modal) => {
            document.body.removeChild(modal);
        });
    }

    createModal(content, width = "400px") {
        // 기존 모달 제거
        this.removeExistingModals();

        const modal = document.createElement("div");
        modal.className = "tournament-modal";
        modal.style.cssText = this.styles.modal(width);
        modal.appendChild(content);
        document.body.appendChild(modal);
        return modal;
    }

    createModalTitle(text, color = "#FFD700") {
        const title = document.createElement("div");
        title.style.cssText = this.styles.modalTitle;
        title.style.color = color;
        title.textContent = text;
        return title;
    }

    createModalButton(text, onClick, gradient = false) {
        const button = document.createElement("button");
        button.style.cssText = gradient
            ? this.styles.gradientButton
            : this.styles.modalButton;
        button.textContent = text;
        button.onclick = onClick;
        return button;
    }

    // 파이널 테이블 관련 메서드들
    showFinalTableQualification(tournament, initialResult) {
        const content = document.createElement("div");

        const title = this.createModalTitle(
            this.language.t("finalTable.qualification")
        );
        content.appendChild(title);

        const resultButton = this.createModalButton(
            this.language.t("finalTable.checkResult"),
            () => {
                document.body.removeChild(modal);
                const finalResult = tournament.getFinalTableResult(
                    this.character,
                    initialResult
                );
                this.showFinalTableResult(finalResult);
            },
            true
        );
        content.appendChild(resultButton);

        const modal = this.createModal(content);
        this.addModalAnimations();
    }

    showFinalTableResult(finalResult) {
        const content = document.createElement("div");

        const title = this.createModalTitle(
            this.language.t("finalTable.result")
        );
        content.appendChild(title);

        content.appendChild(
            this.createFinalTableResultInfo(finalResult.result)
        );

        const closeButton = this.createModalButton(
            this.language.t("confirm"),
            () => {
                document.body.removeChild(modal);
                this.isPendingFinalTable = false;
                this.updateUI();
            }
        );
        content.appendChild(closeButton);

        const modal = this.createModal(content, "500px");
    }

    createFinalTableResultInfo(result) {
        const info = document.createElement("div");
        info.style.cssText = this.styles.resultInfo;
        info.innerHTML = `
            <div style="margin-bottom: 15px">${this.language.t(
                "finalTable.finalRank"
            )}: ${result.rank}${
            this.language.getCurrentLang() === "ko" ? "등" : ""
        }</div>
            <div style="color: rgb(76, 175, 80)">${this.language.t(
                "finalTable.prizeEarned"
            )}: $${result.prize.toLocaleString()}</div>
        `;
        return info;
    }

    // 일반 결과 표시
    showResult(result, tournament) {
        const content = document.createElement("div");
        content.style.textAlign = "center";

        // 결과 제목
        const title = this.createModalTitle(
            this.language.t("tournament.result")
        );
        content.appendChild(title);

        // 결과 정보
        const resultInfo = document.createElement("div");
        resultInfo.style.cssText = `
            margin: 20px 0;
            font-size: 16px;
            color: white;
        `;
        resultInfo.innerHTML = `
            <div style="margin: 10px 0">${this.language.t("rank")}: ${
            result.rank
        }${this.language.getCurrentLang() === "ko" ? "등" : ""} / ${
            result.totalPlayers
        }</div>
            <div style="color: ${result.prize > 0 ? "#4CAF50" : "#666"}">
                ${this.language.t("prize")}: $${result.prize.toLocaleString()}
            </div>
        `;
        content.appendChild(resultInfo);

        // 통계 정보
        const stats = tournament.getStats();
        const statsInfo = document.createElement("div");
        statsInfo.style.cssText = `
            margin: 30px 0;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            font-size: 14px;
        `;

        const statItems = [
            { key: "roi", format: (value) => value.toFixed(2) + "%" },
            { key: "itm", format: (value) => value.toFixed(1) + "%" },
            { key: "finalTable", format: (value) => value.toFixed(1) + "%" },
            { key: "victories", format: (value) => value.toString() },
        ];

        statItems.forEach(({ key, format }) => {
            const statItem = document.createElement("div");
            statItem.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 5px;
            `;
            statItem.innerHTML = `
                <div style="color: #888">${this.language.t(
                    `stats.${key}`
                )}</div>
                <div style="color: #4CAF50; font-size: 18px; font-weight: bold">
                    ${format(stats[key])}
                </div>
            `;
            statsInfo.appendChild(statItem);
        });

        content.appendChild(statsInfo);

        // 확인 버튼
        const confirmButton = this.createModalButton(
            this.language.t("confirm"),
            () => {
                this.updateUI();
            }
        );
        content.appendChild(confirmButton);

        const modal = this.createModal(content);
        this.addModalAnimations();
    }

    // UI 업데이트
    updateUI() {
        this.container.innerHTML = "";
        this.container.appendChild(this.createHeader());

        this.tournaments.forEach((tournament) => {
            this.container.appendChild(this.createTournamentCard(tournament));
        });
    }

    createHeader() {
        const header = document.createElement("div");
        header.style.cssText = this.styles.header;

        const title = document.createElement("span");
        title.textContent = this.language.t("tournamentTitle");

        const resetButton = this.createResetButton();

        header.appendChild(title);
        header.appendChild(resetButton);
        return header;
    }

    createResetButton() {
        const button = document.createElement("button");
        button.style.cssText = this.styles.resetButton;
        button.textContent = this.language.t("resetStats.button");
        button.onclick = () => this.handleResetStats();
        return button;
    }

    handleResetStats() {
        if (confirm(this.language.t("resetStats.confirm"))) {
            this.character.tournament.resetStats();
            alert(this.language.t("resetStats.complete"));
        }
    }

    // 토너먼트 참가 버튼 클릭 핸들러
    handleEnterClick(tournament) {
        if (this.isPendingFinalTable) {
            return;
        }

        const result = tournament.enter(this.character);
        if (!result.success) {
            alert(result.message);
            return;
        }

        // 파이널 테이블 진출 시
        if (result.finalTable) {
            this.isPendingFinalTable = true;
            this.updateUI();
            this.showFinalTableQualification(tournament, result.result);
            return;
        }

        // 일반 결과 표시
        this.showResult(result.result, tournament);
    }

    // 스타일 정의
    styles = {
        tournamentCard: `
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
        `,
        tournamentHeader: `
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            color: rgb(76, 175, 80);
        `,
        enterButton: (isPending) => `
            width: 100%;
            padding: 8px;
            margin-top: 10px;
            background: ${isPending ? "#666" : "rgb(76, 175, 80)"};
            border: none;
            border-radius: 4px;
            color: white;
            cursor: ${isPending ? "not-allowed" : "pointer"};
            font-family: 'system-ui', sans-serif;
            opacity: ${isPending ? "0.7" : "1"};
        `,
        modal: (width) => `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            padding: 30px;
            border-radius: 15px;
            z-index: 2000;
            text-align: center;
            color: white;
            min-width: ${width};
            max-height: 90vh;
            overflow-y: auto;
            animation: fadeIn 0.5s;
        `,
        modalTitle: `
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 30px;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        `,
        modalButton: `
            padding: 10px 20px;
            background: rgb(76, 175, 80);
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
            width: 100%;
        `,
        gradientButton: `
            padding: 15px 30px;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            font-family: 'system-ui', sans-serif;
            font-size: 18px;
            font-weight: bold;
            margin-top: 20px;
            transition: transform 0.2s;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
        `,
        resultInfo: `
            font-size: 24px;
            margin: 20px 0;
            color: #fff;
        `,
        header: `
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: rgb(76, 175, 80);
            display: flex;
            justify-content: space-between;
            align-items: center;
        `,
        resetButton: `
            padding: 5px 10px;
            background: rgba(255, 0, 0, 0.7);
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-size: 12px;
            font-family: 'system-ui', sans-serif;
        `,
    };

    addModalAnimations() {
        const style = document.createElement("style");
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translate(-50%, -60%); }
                to { opacity: 1; transform: translate(-50%, -50%); }
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
}
