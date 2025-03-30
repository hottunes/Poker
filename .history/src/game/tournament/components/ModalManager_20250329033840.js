export class ModalManager {
    constructor(ui) {
        this.ui = ui;
        this.addModalAnimations();
    }

    createModal(content, width = "400px") {
        const modal = document.createElement("div");
        modal.style.cssText = this.ui.styles.modal(width);
        modal.appendChild(content);
        document.body.appendChild(modal);
        return modal;
    }

    createModalTitle(text, color = "#FFD700") {
        const title = document.createElement("div");
        title.style.cssText = this.ui.styles.modalTitle;
        title.style.color = color;
        title.textContent = text;
        return title;
    }

    createModalButton(text, onClick, gradient = false) {
        const button = document.createElement("button");
        button.style.cssText = gradient
            ? this.ui.styles.gradientButton
            : this.ui.styles.modalButton;
        button.textContent = text;
        button.onclick = onClick;
        return button;
    }

    showFinalTableQualification(tournament, initialResult) {
        const content = document.createElement("div");

        const title = this.createModalTitle(
            this.ui.language.t("finalTable.qualification")
        );
        content.appendChild(title);

        const resultButton = this.createModalButton(
            this.ui.language.t("finalTable.checkResult"),
            () => {
                document.body.removeChild(modal);
                const finalResult = tournament.getFinalTableResult(
                    this.ui.game.character,
                    initialResult
                );
                this.showFinalTableResult(finalResult);
            },
            true
        );
        content.appendChild(resultButton);

        const modal = this.createModal(content);
    }

    showFinalTableResult(finalResult) {
        const content = document.createElement("div");

        const title = this.createModalTitle(
            this.ui.language.t("finalTable.result")
        );
        content.appendChild(title);

        content.appendChild(
            this.createFinalTableResultInfo(finalResult.result)
        );

        const closeButton = this.createModalButton(
            this.ui.language.t("confirm"),
            () => {
                document.body.removeChild(modal);
                this.ui.isPendingFinalTable = false;
                this.ui.updateUI();
            }
        );
        content.appendChild(closeButton);

        const modal = this.createModal(content, "500px");
    }

    createFinalTableResultInfo(result) {
        const info = document.createElement("div");
        info.style.cssText = this.ui.styles.resultInfo;
        info.innerHTML = `
            <div style="margin-bottom: 15px">${this.ui.language.t(
                "finalTable.finalRank"
            )}: ${result.rank}${
            this.ui.language.getCurrentLang() === "ko" ? "등" : ""
        }</div>
            <div style="color: rgb(76, 175, 80)">${this.ui.language.t(
                "finalTable.prizeEarned"
            )}: $${result.prize.toLocaleString()}</div>
        `;
        return info;
    }

    showResult(result) {
        const content = document.createElement("div");

        const title = this.createModalTitle(
            this.getTournamentResultTitle(result),
            result.prize > 0 ? "rgb(76, 175, 80)" : "#666"
        );
        content.appendChild(title);

        content.appendChild(this.createResultDetails(result));

        const closeButton = this.createModalButton(
            this.ui.language.t("confirm"),
            () => {
                document.body.removeChild(modal);
            }
        );
        content.appendChild(closeButton);

        const modal = this.createModal(content, "300px");
    }

    getTournamentResultTitle(result) {
        if (result.rank === 1) return this.ui.language.t("victory");
        if (result.prize > 0)
            return this.ui.language.t("rankAchieved", { rank: result.rank });
        return this.ui.language.t("rank", { rank: result.rank });
    }

    createResultDetails(result) {
        const details = document.createElement("div");
        details.style.marginBottom = "20px";
        details.innerHTML = this.getResultDetailsHTML(result);
        return details;
    }

    getResultDetailsHTML(result) {
        let html = this.getPrizeHTML(result);
        html += this.getStatsHTML(result);
        html += this.getTournamentStatsHTML(result);
        return html;
    }

    getPrizeHTML(result) {
        if (result.prize > 0) {
            return `
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 14px; color: #888; margin-bottom: 5px;">${this.ui.language.t(
                        "prizeEarned"
                    )}</div>
                    <div style="color: rgb(76, 175, 80); font-size: 24px; font-weight: bold;">
                        $${result.prize.toLocaleString()}
                    </div>
                </div>
            `;
        }
        return `
            <div style="margin-bottom: 15px;">
                <div style="font-size: 14px; color: #888; margin-bottom: 5px;">${this.ui.language.t(
                    "prizeEarned"
                )}</div>
                <div style="color: #666; font-size: 18px;">
                    ${this.ui.language.t("noPrize")}
                </div>
            </div>
        `;
    }

    getStatsHTML(result) {
        return `
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <div style="margin-bottom: 8px;">
                    <span style="color: #888;">${this.ui.language.t(
                        "totalParticipants"
                    )}:</span>
                    <span style="float: right;">${result.totalPlayers}${
            this.ui.language.getCurrentLang() === "ko" ? "명" : ""
        }</span>
                </div>
                <div style="margin-bottom: 8px;">
                    <span style="color: #888;">${this.ui.language.t(
                        "ranking"
                    )}:</span>
                    <span style="float: right;">${result.rank}${
            this.ui.language.getCurrentLang() === "ko" ? "등" : ""
        }</span>
                </div>
                <div>
                    <span style="color: #888;">${this.ui.language.t(
                        "scoreEarned"
                    )}:</span>
                    <span style="float: right;">${Math.round(result.score)}${
            this.ui.language.getCurrentLang() === "ko" ? "점" : ""
        }</span>
                </div>
            </div>
        `;
    }

    getTournamentStatsHTML(result) {
        const stats = this.ui.game.character.tournament.getLogStats(
            this.ui.game.character.name
        );
        if (!stats) return "";

        return `
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <div style="font-size: 14px; color: #888; margin-bottom: 10px;">${this.ui.language.t(
                    "tournamentStats"
                )}</div>
                <div style="margin-bottom: 8px;">
                    <span style="color: #888;">${this.ui.language.t(
                        "totalGames"
                    )}:</span>
                    <span style="float: right;">${stats.totalGames}${
            this.ui.language.getCurrentLang() === "ko" ? "회" : ""
        }</span>
                </div>
                <div style="margin-bottom: 8px;">
                    <span style="color: #888;">${this.ui.language.t(
                        "averageRank"
                    )}:</span>
                    <span style="float: right;">${stats.averageRank}${
            this.ui.language.getCurrentLang() === "ko" ? "등" : ""
        }</span>
                </div>
                <div style="margin-bottom: 8px;">
                    <span style="color: #888;">${this.ui.language.t(
                        "itmRate"
                    )}:</span>
                    <span style="float: right;">${stats.itmRate.toFixed(
                        2
                    )}%</span>
                </div>
                <div style="margin-bottom: 8px;">
                    <span style="color: #888;">${this.ui.language.t(
                        "finalTableRate"
                    )}:</span>
                    <span style="float: right;">${stats.finalTableRate.toFixed(
                        2
                    )}%</span>
                </div>
                <div>
                    <span style="color: #888;">${this.ui.language.t(
                        "winRate"
                    )}:</span>
                    <span style="float: right;">${stats.winRate.toFixed(
                        2
                    )}%</span>
                </div>
                <div>
                    <span style="color: #888;">${this.ui.language.t(
                        "roi"
                    )}:</span>
                    <span style="float: right; color: ${
                        stats.roi >= 0 ? "#4CAF50" : "#FF5252"
                    }">${stats.roi >= 0 ? "+" : ""}${stats.roi}%</span>
                </div>
            </div>
        `;
    }

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
