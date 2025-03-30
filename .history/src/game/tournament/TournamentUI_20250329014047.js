import { Tournament } from "./Tournament";
import { Language } from "../i18n/Language";

export class TournamentUI {
    constructor(game) {
        this.game = game;
        this.language = game.language;
        this.container = this.createContainer();
        this.tournaments = [
            new Tournament("online", 100, 1000),
            new Tournament("major", 2000, 100),
        ];
        this.isPendingFinalTable = false; // 파이널 테이블 결과 확인 대기 상태

        // 캐릭터에 토너먼트 참조 추가
        this.game.character.tournament = this.tournaments[0]; // 온라인 토너먼트를 기본값으로 설정

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
            color: rgb(76, 175, 80);
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
            background: ${
                this.isPendingFinalTable ? "#666" : "rgb(76, 175, 80)"
            };
            border: none;
            border-radius: 4px;
            color: white;
            cursor: ${this.isPendingFinalTable ? "not-allowed" : "pointer"};
            font-family: 'system-ui', sans-serif;
            opacity: ${this.isPendingFinalTable ? "0.7" : "1"};
        `;
        button.textContent = this.language.t("enterButton");
        button.disabled = this.isPendingFinalTable;
        button.onclick = () => this.handleEnterClick(tournament);
        card.appendChild(button);

        return card;
    }

    // 토너먼트 참가 버튼 클릭 핸들러
    handleEnterClick(tournament) {
        if (this.isPendingFinalTable) {
            return; // 파이널 테이블 결과 확인 대기 중이면 참가 불가
        }

        const result = tournament.enter(this.game.character);
        if (!result.success) {
            alert(result.message);
            return;
        }

        if (result.finalTable) {
            this.isPendingFinalTable = true; // 파이널 테이블 결과 확인 대기 상태로 설정
            this.updateUI(); // UI 업데이트하여 버튼 비활성화
            this.showFinalTableQualification(tournament, result.result);
        } else {
            this.showResult(result.result);
        }
    }

    // 파이널 테이블 진출 연출
    showFinalTableQualification(tournament, initialResult) {
        const modal = document.createElement("div");
        modal.style.cssText = `
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
            animation: fadeIn 1s;
        `;

        // 파이널 테이블 진출 타이틀
        const title = document.createElement("div");
        title.style.cssText = `
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 30px;
            color: #FFD700;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
            animation: pulse 2s infinite;
        `;
        title.textContent = this.language.t("finalTable.qualification");
        modal.appendChild(title);

        // 결과 확인 버튼
        const resultButton = document.createElement("button");
        resultButton.style.cssText = `
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
        `;
        resultButton.textContent = this.language.t("finalTable.checkResult");
        resultButton.onmouseover = () => {
            resultButton.style.transform = "scale(1.05)";
        };
        resultButton.onmouseout = () => {
            resultButton.style.transform = "scale(1)";
        };
        resultButton.onclick = () => {
            document.body.removeChild(modal);
            const finalResult = tournament.getFinalTableResult(
                this.game.character,
                initialResult
            );
            this.showFinalTableResult(finalResult);
        };
        modal.appendChild(resultButton);

        // CSS 애니메이션 추가
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

        document.body.appendChild(modal);
    }

    // 파이널 테이블 최종 결과 표시
    showFinalTableResult(finalResult) {
        const modal = document.createElement("div");
        modal.style.cssText = `
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
            min-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            animation: fadeIn 0.5s;
        `;

        // 결과 타이틀
        const title = document.createElement("div");
        title.style.cssText = `
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 30px;
            color: #FFD700;
        `;
        title.textContent = this.language.t("finalTable.result");
        modal.appendChild(title);

        // 최종 순위와 상금 표시
        const result = finalResult.result;
        const resultInfo = document.createElement("div");
        resultInfo.style.cssText = `
            font-size: 24px;
            margin: 20px 0;
            color: #fff;
        `;
        resultInfo.innerHTML = `
            <div style="margin-bottom: 15px">${this.language.t(
                "finalTable.finalRank"
            )}: ${result.rank}${
            this.language.getCurrentLang() === "ko" ? "등" : ""
        }</div>
            <div style="color: rgb(76, 175, 80)">${this.language.t(
                "finalTable.prizeEarned"
            )}: $${result.prize.toLocaleString()}</div>
        `;
        modal.appendChild(resultInfo);

        // 확인 버튼
        const closeButton = document.createElement("button");
        closeButton.style.cssText = `
            padding: 10px 20px;
            background: rgb(76, 175, 80);
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
        `;
        closeButton.textContent = this.language.t("confirm");
        closeButton.onclick = () => {
            document.body.removeChild(modal);
            this.isPendingFinalTable = false; // 결과 확인 완료 후 상태 초기화
            this.updateUI(); // UI 업데이트하여 버튼 활성화
        };
        modal.appendChild(closeButton);

        document.body.appendChild(modal);
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
            color: ${result.prize > 0 ? "rgb(76, 175, 80)" : "#666"};
        `;

        const totalPlayers = result.totalPlayers;
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
                    <div style="color: rgb(76, 175, 80); font-size: 24px; font-weight: bold;">
                        $${result.prize.toLocaleString()}
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
                        <span style="float: right;">${stats.itmRate.toFixed(
                            2
                        )}%</span>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <span style="color: #888;">${this.language.t(
                            "finalTableRate"
                        )}:</span>
                        <span style="float: right;">${stats.finalTableRate.toFixed(
                            2
                        )}%</span>
                    </div>
                    <div>
                        <span style="color: #888;">${this.language.t(
                            "winRate"
                        )}:</span>
                        <span style="float: right;">${stats.winRate.toFixed(
                            2
                        )}%</span>
                    </div>
                    <div>
                        <span style="color: #888;">${this.language.t(
                            "roi"
                        )}:</span>
                        <span style="float: right; color: ${
                            stats.roi >= 0 ? "#4CAF50" : "#FF5252"
                        }">${stats.roi >= 0 ? "+" : ""}${stats.roi}%</span>
                    </div>
                </div>
            `;
        }

        details.innerHTML = resultDetails;
        modal.appendChild(details);

        const button = document.createElement("button");
        button.style.cssText = `
            padding: 10px 20px;
            background: rgb(76, 175, 80);
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
            color: rgb(76, 175, 80);
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const titleContainer = document.createElement("div");
        titleContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        const title = document.createElement("span");
        title.textContent = this.language.t("tournamentTitle");

        // 언어 선택 드롭다운
        const langSelect = document.createElement("select");
        langSelect.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 2px 5px;
            font-size: 12px;
            cursor: pointer;
            outline: none;
        `;

        const languages = {
            ko: "한국어",
            en: "English",
            ja: "日本語",
            zh: "中文",
        };

        Object.entries(languages).forEach(([code, name]) => {
            const option = document.createElement("option");
            option.value = code;
            option.textContent = name;
            option.selected = this.language.getCurrentLang() === code;
            langSelect.appendChild(option);
        });

        langSelect.onchange = (e) => {
            this.language.setLanguage(e.target.value);
        };

        titleContainer.appendChild(title);
        titleContainer.appendChild(langSelect);

        // 리셋 버튼 추가
        const resetButton = document.createElement("button");
        resetButton.style.cssText = `
            padding: 5px 10px;
            background: rgba(255, 0, 0, 0.7);
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-size: 12px;
            font-family: 'system-ui', sans-serif;
        `;
        resetButton.textContent = this.language.t("resetStats.button");
        resetButton.onclick = () => {
            if (confirm(this.language.t("resetStats.confirm"))) {
                this.game.character.tournament.resetStats();
                alert(this.language.t("resetStats.complete"));
            }
        };

        header.appendChild(titleContainer);
        header.appendChild(resetButton);
        this.container.appendChild(header);

        // 기존 토너먼트 인스턴스 사용
        this.tournaments.forEach((tournament) => {
            this.container.appendChild(this.createTournamentCard(tournament));
        });
    }
}
