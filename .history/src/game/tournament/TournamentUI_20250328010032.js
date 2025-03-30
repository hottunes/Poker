import { Tournament } from "./Tournament";
import { Language } from "../i18n/Language";

export class TournamentUI {
    constructor(game) {
        this.game = game;
        this.language = game.language;
        this.container = this.createContainer();
        this.tournaments = [];

        // 언어 변경 시 UI 업데이트
        this.language.addObserver(() => this.updateUI());

        this.updateUI();
    }

    createContainer() {
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

    createLanguageSelector() {
        const container = document.createElement("div");
        container.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px;
            border-radius: 5px;
            z-index: 1000;
        `;

        const languages = [
            { code: "ko", name: "한국어" },
            { code: "en", name: "English" },
            { code: "ja", name: "日本語" },
            { code: "zh", name: "中文" },
        ];

        languages.forEach((lang) => {
            const button = document.createElement("button");
            button.style.cssText = `
                margin: 0 5px;
                padding: 5px 10px;
                background: ${
                    this.language.getCurrentLang() === lang.code
                        ? "#4CAF50"
                        : "#333"
                };
                border: none;
                border-radius: 3px;
                color: white;
                cursor: pointer;
                font-family: 'system-ui', sans-serif;
            `;
            button.textContent = lang.name;
            button.onclick = () => this.language.setLanguage(lang.code);
            container.appendChild(button);
        });

        return container;
    }

    createTournamentCard(tournament) {
        const card = document.createElement("div");
        card.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
        `;

        const info = tournament.getInfo();

        // 토너먼트 이름과 타입
        const header = document.createElement("div");
        header.style.cssText = `
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #4CAF50;
        `;
        header.textContent = `${this.language.t(
            `tournamentNames.${tournament.type}`
        )} (${this.language.t(tournament.type)})`;
        card.appendChild(header);

        // 토너먼트 정보
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
        card.appendChild(details);

        // 참가 버튼
        const button = document.createElement("button");
        button.style.cssText = `
            width: 100%;
            padding: 8px;
            margin-top: 10px;
            background: #4CAF50;
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-family: 'system-ui', sans-serif;
        `;
        button.textContent = this.language.t("enterButton");
        button.onclick = () => this.enterTournament(tournament);
        card.appendChild(button);

        return card;
    }

    enterTournament(tournament) {
        // 선택한 토너먼트를 캐릭터에 연결
        this.game.character.tournament = tournament;

        const result = tournament.enter(this.game.character);
        if (result.success) {
            this.showResult(result.result);
            this.game.characterUI.updateUI();
        } else {
            alert(result.message);
        }
    }

    showResult(result) {
        const modal = document.createElement("div");
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 10px;
            z-index: 2000;
            text-align: center;
            color: white;
            min-width: 300px;
            max-height: 80vh;
            overflow-y: auto;
        `;

        const title = document.createElement("div");
        title.style.cssText = `
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: ${result.prize > 0 ? "#4CAF50" : "#666"};
        `;

        const totalPlayers = result.totalPlayers;
        const itmCount = Math.floor(totalPlayers * 0.15); // ITM은 상위 15%
        const isITM = result.prize > 0; // 상금이 있으면 ITM

        if (result.rank === 1) {
            title.textContent = this.language.t("victory");
        } else if (isITM) {
            title.textContent = this.language.t("rankAchieved", {
                rank: result.rank,
            });
        } else {
            title.textContent = this.language.t("rank", { rank: result.rank });
        }
        modal.appendChild(title);

        const details = document.createElement("div");
        details.style.marginBottom = "20px";

        let resultDetails = "";

        if (result.prize > 0) {
            resultDetails += `
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 14px; color: #888; margin-bottom: 5px;">${this.language.t(
                        "prizeEarned"
                    )}</div>
                    <div style="color: #4CAF50; font-size: 24px; font-weight: bold;">
                        ${result.prize.toLocaleString()}
                    </div>
                </div>
            `;
        } else {
            resultDetails += `
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 14px; color: #888; margin-bottom: 5px;">${this.language.t(
                        "prizeEarned"
                    )}</div>
                    <div style="color: #666; font-size: 18px;">
                        ${this.language.t("noPrize")}
                    </div>
                </div>
            `;
        }

        resultDetails += `
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <div style="margin-bottom: 8px;">
                    <span style="color: #888;">${this.language.t(
                        "totalParticipants"
                    )}:</span>
                    <span style="float: right;">${totalPlayers}${
            this.language.getCurrentLang() === "ko" ? "명" : ""
        }</span>
                </div>
                <div style="margin-bottom: 8px;">
                    <span style="color: #888;">${this.language.t(
                        "ranking"
                    )}:</span>
                    <span style="float: right;">${result.rank}${
            this.language.getCurrentLang() === "ko" ? "등" : ""
        }</span>
                </div>
                <div style="margin-bottom: 8px;">
                    <span style="color: #888;">${this.language.t(
                        "topPercent"
                    )}:</span>
                    <span style="float: right;">${Math.round(
                        result.percentile
                    )}%</span>
                </div>
                <div>
                    <span style="color: #888;">${this.language.t(
                        "scoreEarned"
                    )}:</span>
                    <span style="float: right;">${Math.round(result.score)}${
            this.language.getCurrentLang() === "ko" ? "점" : ""
        }</span>
                </div>
            </div>
        `;

        // 토너먼트 통계 추가
        const stats = this.game.character.tournament.getLogStats(
            this.game.character.name
        );
        if (stats) {
            resultDetails += `
                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="font-size: 14px; color: #888; margin-bottom: 10px;">${this.language.t(
                        "tournamentStats"
                    )}</div>
                    <div style="margin-bottom: 8px;">
                        <span style="color: #888;">${this.language.t(
                            "totalGames"
                        )}:</span>
                        <span style="float: right;">${stats.totalGames}${
                this.language.getCurrentLang() === "ko" ? "회" : ""
            }</span>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <span style="color: #888;">${this.language.t(
                            "bestRank"
                        )}:</span>
                        <span style="float: right;">${stats.bestRank}${
                this.language.getCurrentLang() === "ko" ? "등" : ""
            }</span>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <span style="color: #888;">${this.language.t(
                            "averageRank"
                        )}:</span>
                        <span style="float: right;">${stats.averageRank}${
                this.language.getCurrentLang() === "ko" ? "등" : ""
            }</span>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <span style="color: #888;">${this.language.t(
                            "itmRate"
                        )}:</span>
                        <span style="float: right;">${stats.itmRate}%</span>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <span style="color: #888;">${this.language.t(
                            "winRate"
                        )}:</span>
                        <span style="float: right;">${stats.winRate}%</span>
                    </div>
                    <div>
                        <span style="color: #888;">${this.language.t(
                            "totalPrize"
                        )}:</span>
                        <span style="float: right;">${stats.totalPrize.toLocaleString()}</span>
                    </div>
                </div>
            `;
        }

        details.innerHTML = resultDetails;
        modal.appendChild(details);

        const button = document.createElement("button");
        button.style.cssText = `
            padding: 10px 20px;
            background: #4CAF50;
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-family: 'system-ui', sans-serif;
            width: 100%;
            font-size: 16px;
        `;
        button.textContent = this.language.t("confirm");
        button.onclick = () => {
            document.body.removeChild(modal);
        };
        modal.appendChild(button);

        document.body.appendChild(modal);
    }

    updateUI() {
        this.container.innerHTML = "";

        const header = document.createElement("div");
        header.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #4CAF50;
        `;
        header.textContent = this.language.t("tournamentTitle");
        this.container.appendChild(header);

        // 언어 선택기 업데이트
        const existingSelector = document.querySelector(".language-selector");
        if (existingSelector) {
            document.body.removeChild(existingSelector);
        }
        const languageSelector = this.createLanguageSelector();
        languageSelector.className = "language-selector";
        document.body.appendChild(languageSelector);

        // 토너먼트 생성 시 character 연결
        const tournaments = [
            new Tournament("online", 100, 1000),
            new Tournament("major", 2000, 100),
        ];

        // 캐릭터에 토너먼트 참조 추가
        this.game.character.tournament = tournaments[0]; // 온라인 토너먼트를 기본값으로 설정

        tournaments.forEach((tournament) => {
            this.container.appendChild(this.createTournamentCard(tournament));
        });
    }
}
