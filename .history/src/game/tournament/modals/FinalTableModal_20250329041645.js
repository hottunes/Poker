import { Modal } from "../components/Modal";
import { styles } from "../styles/styles";

export class FinalTableModal extends Modal {
    constructor(language, onResultConfirm) {
        super("500px");
        this.language = language;
        this.onResultConfirm = onResultConfirm;
    }

    showQualification(tournament, initialResult) {
        const content = document.createElement("div");

        const title = this.createTitle(
            this.language.t("finalTable.qualification")
        );
        content.appendChild(title);

        const resultButton = this.createButton(
            this.language.t("finalTable.checkResult"),
            () => {
                this.close();
                const finalResult = tournament.getFinalTableResult(
                    tournament.game.character,
                    initialResult
                );
                this.showResult(finalResult);
            },
            true
        );
        content.appendChild(resultButton);

        this.setContent(content);
    }

    showResult(finalResult) {
        const content = document.createElement("div");

        const title = this.createTitle(this.language.t("finalTable.result"));
        content.appendChild(title);

        content.appendChild(this.createResultInfo(finalResult.result));

        const closeButton = this.createButton(
            this.language.t("confirm"),
            () => {
                this.close();
                this.onResultConfirm();
            }
        );
        content.appendChild(closeButton);

        this.setContent(content);
    }

    createResultInfo(result) {
        const info = document.createElement("div");
        info.style.cssText = styles.resultInfo;
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
}
