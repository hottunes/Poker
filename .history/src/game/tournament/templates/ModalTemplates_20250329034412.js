export class ModalTemplates {
    static resultDetails(result, language) {
        return `
            <div class="result-details">
                ${this.prizeSection(result, language)}
                ${this.statsSection(result, language)}
                ${this.tournamentStatsSection(result, language)}
            </div>
        `;
    }

    static prizeSection(result, language) {
        return `
            <div style="color: rgb(76, 175, 80)">
                ${language.t("prize")}: $${result.prize.toLocaleString()}
            </div>
        `;
    }

    static statsSection(result, language) {
        return `
            <div style="margin-top: 15px">
                ${language.t("stats")}:<br>
                ${language.t("luck")}: ${result.luck.toFixed(2)}<br>
                ${language.t("skill")}: ${result.skill.toFixed(2)}
            </div>
        `;
    }

    static tournamentStatsSection(result, language) {
        return `
            <div style="margin-top: 15px">
                ${language.t("tournamentStats")}:<br>
                ${language.t("totalTournaments")}: ${
            result.totalTournaments
        }<br>
                ${language.t(
                    "totalPrize"
                )}: $${result.totalPrize.toLocaleString()}<br>
                ${language.t("averageRank")}: ${result.averageRank.toFixed(1)}
            </div>
        `;
    }

    static finalTableResultInfo(result, language) {
        return `
            <div style="margin-bottom: 15px">
                ${language.t("finalTable.finalRank")}: ${result.rank}${
            language.getCurrentLang() === "ko" ? "등" : ""
        }
            </div>
            <div style="color: rgb(76, 175, 80)">
                ${language.t(
                    "finalTable.prizeEarned"
                )}: $${result.prize.toLocaleString()}
            </div>
        `;
    }
}
