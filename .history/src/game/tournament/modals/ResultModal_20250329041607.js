import { Modal } from "../components/Modal";

export class ResultModal extends Modal {
    constructor(language) {
        super("300px");
        this.language = language;
    }

    show(result) {
        const content = document.createElement("div");

        const title = this.createTitle(
            this.getTournamentResultTitle(result),
            result.prize > 0 ? "rgb(76, 175, 80)" : "#666"
        );
        content.appendChild(title);

        content.appendChild(this.createResultDetails(result));

        const closeButton = this.createButton(this.language.t("confirm"), () =>
            this.close()
        );
        content.appendChild(closeButton);

        this.setContent(content);
    }

    getTournamentResultTitle(result) {
        if (result.rank === 1) return this.language.t("victory");
        if (result.prize > 0)
            return this.language.t("rankAchieved", { rank: result.rank });
        return this.language.t("rank", { rank: result.rank });
    }

    createResultDetails(result) {
        const details = document.createElement("div");
        details.style.marginBottom = "20px";

        let resultDetails = this.createPrizeSection(result);
        resultDetails += this.createStatsSection(result);
        resultDetails += this.createTournamentStats(result);

        details.innerHTML = resultDetails;
        return details;
    }

    createPrizeSection(result) {
        if (result.prize > 0) {
            return `
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 14px; color: #888; margin-bottom: 5px;">
                        ${this.language.t("prizeEarned")}
                    </div>
                    <div style="color: rgb(76, 175, 80); font-size: 24px; font-weight: bold;">
                        $${result.prize.toLocaleString()}
                    </div>
                </div>
            `;
        }
        return `
            <div style="margin-bottom: 15px;">
                <div style="font-size: 14px; color: #888; margin-bottom: 5px;">
                    ${this.language.t("prizeEarned")}
                </div>
                <div style="color: #666; font-size: 18px;">
                    ${this.language.t("noPrize")}
                </div>
            </div>
        `;
    }

    createStatsSection(result) {
        return `
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <div style="margin-bottom: 8px;">
                    <span style="color: #888;">${this.language.t(
                        "totalParticipants"
                    )}:</span>
                    <span style="float: right;">${result.totalPlayers}${
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
    }

    createTournamentStats(result) {
        const stats = result.tournament.getLogStats(result.character.name);
        if (!stats) return "";

        return `
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <div style="font-size: 14px; color: #888; margin-bottom: 10px;">
                    ${this.language.t("tournamentStats")}
                </div>
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
                <div style="margin-bottom: 8px;">
                    <span style="color: #888;">${this.language.t(
                        "winRate"
                    )}:</span>
                    <span style="float: right;">${stats.winRate.toFixed(
                        2
                    )}%</span>
                </div>
                <div>
                    <span style="color: #888;">${this.language.t("roi")}:</span>
                    <span style="float: right; color: ${
                        stats.roi >= 0 ? "#4CAF50" : "#FF5252"
                    }">${stats.roi >= 0 ? "+" : ""}${stats.roi}%</span>
                </div>
            </div>
        `;
    }
}
