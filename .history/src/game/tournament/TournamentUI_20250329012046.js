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
        button.onclick = () => this.handleEnterClick(tournament);
        card.appendChild(button);

        return card;
    }

    // 토너먼트 참가 버튼 클릭 핸들러
    handleEnterClick(tournament) {
        const result = tournament.enter(this.game.character);
        if (!result.success) {
            alert(result.message);
            return;
        }

        if (result.finalTable) {
            // 파이널 테이블 진출 시 화려한 연출
            this.showFinalTableQualification(tournament, result.result);
        } else {
            // 일반 결과 표시
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
        title.textContent = "🏆 파이널 테이블 진출! 🏆";
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
        resultButton.textContent = "파이널 테이블 결과 확인";
        resultButton.onmouseover = () => {
            resultButton.style.transform = "scale(1.05)";
        };
        resultButton.onmouseout = () => {
            resultButton.style.transform = "scale(1)";
        };
        resultButton.onclick = () => {
            document.body.removeChild(modal);
            // getFinalTableResult 호출하여 결과 확인
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
        title.textContent = "🏆 파이널 테이블 결과 🏆";
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
            <div style="margin-bottom: 15px">최종 순위: ${result.rank}등</div>
            <div style="color: #4CAF50">획득 상금: $${result.prize.toLocaleString()}</div>
        `;
        modal.appendChild(resultInfo);

        // 확인 버튼
        const closeButton = document.createElement("button");
        closeButton.style.cssText = `
            padding: 10px 20px;
            background: #4CAF50;
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
        `;
        closeButton.textContent = "확인";
        closeButton.onclick = () => document.body.removeChild(modal);
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
            color: ${result.prize > 0 ? "#4CAF50" : "#666"};
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
                    <div style="color: #4CAF50; font-size: 24px; font-weight: bold;">
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
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const title = document.createElement("span");
        title.textContent = this.language.t("tournamentTitle");

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

        header.appendChild(title);
        header.appendChild(resetButton);
        this.container.appendChild(header);

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
