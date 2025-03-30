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

        // 상금을 캐릭터 자금에 추가
        if (finalResult.result.prize > 0) {
            this.character.modifyResource("bankroll", finalResult.result.prize);
        }

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
    showResult(result) {
        // 이전 모달창 제거
        this.container.innerHTML = "";

        const resultContainer = document.createElement("div");
        resultContainer.className = "tournament-result";
        resultContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 10px;
            color: white;
            text-align: center;
            min-width: 300px;
        `;

        const rankText = document.createElement("h2");
        rankText.textContent = `최종 순위: ${result.rank}위`;
        rankText.style.color = "#FFD700";
        resultContainer.appendChild(rankText);

        if (result.prize > 0) {
            const prizeText = document.createElement("p");
            prizeText.textContent = `상금: $${result.prize.toLocaleString()}`;
            prizeText.style.color = "#00FF00";
            resultContainer.appendChild(prizeText);
        }

        const closeButton = document.createElement("button");
        closeButton.textContent = "닫기";
        closeButton.style.cssText = `
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
        `;
        closeButton.onclick = () => {
            this.container.innerHTML = "";
        };
        resultContainer.appendChild(closeButton);

        this.container.appendChild(resultContainer);
    }

    showFinalTableButton(result) {
        // 이전 모달창 제거
        this.container.innerHTML = "";

        const buttonContainer = document.createElement("div");
        buttonContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        `;

        const messageText = document.createElement("p");
        messageText.textContent = "파이널 테이블에 진출하셨습니다!";
        messageText.style.cssText = `
            color: #FFD700;
            font-size: 18px;
            margin-bottom: 20px;
        `;
        buttonContainer.appendChild(messageText);

        const resultButton = document.createElement("button");
        resultButton.textContent = "결과 확인";
        resultButton.style.cssText = `
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
        `;
        resultButton.onclick = () => {
            this.container.innerHTML = "";
            this.showFinalTableResult(result);
        };
        buttonContainer.appendChild(resultButton);

        this.container.appendChild(buttonContainer);
    }

    showFinalTableResult(result) {
        // 이전 모달창 제거
        this.container.innerHTML = "";

        const finalResult = this.tournament.getFinalTableResult(
            this.game.character,
            result
        );

        const resultContainer = document.createElement("div");
        resultContainer.className = "tournament-final-result";
        resultContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 10px;
            color: white;
            text-align: center;
            min-width: 300px;
        `;

        const titleText = document.createElement("h2");
        titleText.textContent = "파이널 테이블 결과";
        titleText.style.color = "#FFD700";
        resultContainer.appendChild(titleText);

        const rankText = document.createElement("p");
        rankText.textContent = `최종 순위: ${finalResult.result.rank}위`;
        rankText.style.fontSize = "18px";
        resultContainer.appendChild(rankText);

        if (finalResult.result.prize > 0) {
            const prizeText = document.createElement("p");
            prizeText.textContent = `상금: $${finalResult.result.prize.toLocaleString()}`;
            prizeText.style.color = "#00FF00";
            prizeText.style.fontSize = "18px";
            resultContainer.appendChild(prizeText);
        }

        const closeButton = document.createElement("button");
        closeButton.textContent = "닫기";
        closeButton.style.cssText = `
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
        `;
        closeButton.onclick = () => {
            this.container.innerHTML = "";
        };
        resultContainer.appendChild(closeButton);

        this.container.appendChild(resultContainer);
    }

    showMessage(message) {
        // 이전 모달창 제거
        this.container.innerHTML = "";

        const messageContainer = document.createElement("div");
        messageContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 10px;
            color: white;
            text-align: center;
        `;

        const messageText = document.createElement("p");
        messageText.textContent = message;
        messageContainer.appendChild(messageText);

        const closeButton = document.createElement("button");
        closeButton.textContent = "닫기";
        closeButton.style.cssText = `
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
        `;
        closeButton.onclick = () => {
            this.container.innerHTML = "";
        };
        messageContainer.appendChild(closeButton);

        this.container.appendChild(messageContainer);
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
        const stats = tournament.getStats();
        this.showResult(result.result);
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
        resultWindow: `
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
            min-width: 400px;
            max-height: 90vh;
            overflow-y: auto;
            animation: fadeIn 0.5s;
        `,
        resultTitle: `
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #FFD700;
        `,
        resultContent: `
            margin: 20px 0;
        `,
        resultRank: `
            font-size: 32px;
            font-weight: bold;
            color: #4CAF50;
            margin-bottom: 15px;
        `,
        resultPrize: `
            font-size: 24px;
            color: #4CAF50;
            margin-bottom: 20px;
        `,
        statsSection: `
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        `,
        statsTitle: `
            font-size: 18px;
            font-weight: bold;
            color: #FFD700;
            margin-bottom: 15px;
        `,
        statsContent: `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            font-size: 16px;
            color: white;
        `,
        closeButton: `
            padding: 10px 20px;
            background: #666;
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
            width: 100%;
            transition: background-color 0.2s;
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

    onResize(width, height) {
        // 화면 크기에 따라 위치 조정
        if (width <= 768) {
            // 모바일 화면
            this.container.style.right = "10px";
            this.container.style.top = "150px"; // 프로필 아래로
        } else {
            // 데스크톱 화면
            this.container.style.right = "20px";
            this.container.style.top = "80px";
        }
    }

    showTournamentInfo(type) {
        // 이전 모달창 제거
        this.container.innerHTML = "";

        const infoContainer = document.createElement("div");
        infoContainer.className = "tournament-info";
        infoContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 10px;
            color: white;
            text-align: center;
            min-width: 300px;
        `;

        // 토너먼트 정보 표시
        const info = this.tournament.getInfo();

        const titleText = document.createElement("h2");
        titleText.textContent =
            type === "online" ? "온라인 스페셜" : "하이롤러";
        titleText.style.color = "#FFD700";
        infoContainer.appendChild(titleText);

        const buyInText = document.createElement("p");
        buyInText.textContent = `참가비: $${info.buyIn.toLocaleString()}`;
        infoContainer.appendChild(buyInText);

        const prizepoolText = document.createElement("p");
        prizepoolText.textContent = `총 상금: $${info.prizePool.toLocaleString()}`;
        infoContainer.appendChild(prizepoolText);

        const playersText = document.createElement("p");
        playersText.textContent = `참가자: ${info.currentPlayers}/${info.maxPlayers}명`;
        infoContainer.appendChild(playersText);

        // 참가 버튼
        const enterButton = document.createElement("button");
        enterButton.textContent = "참가하기";
        enterButton.style.cssText = `
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 10px;
        `;
        enterButton.onclick = () => this.enterTournament();
        infoContainer.appendChild(enterButton);

        // 닫기 버튼
        const closeButton = document.createElement("button");
        closeButton.textContent = "닫기";
        closeButton.style.cssText = `
            background: #f44336;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 10px;
        `;
        closeButton.onclick = () => {
            infoContainer.remove();
        };
        infoContainer.appendChild(closeButton);

        this.container.appendChild(infoContainer);
    }

    enterTournament() {
        // 이전 모달창 제거
        this.container.innerHTML = "";

        // 토너먼트 참가 처리
        const result = this.tournament.enter(this.game.character);

        if (!result.success) {
            this.showMessage(result.message);
            return;
        }

        if (result.finalTable) {
            // 파이널 테이블 진출 시 결과 표시
            this.showFinalTableButton(result.result);
        } else {
            // 일반 결과 표시
            this.showResult(result.result);
        }
    }
}
