import { ModalTemplates } from "../templates/ModalTemplates";

export class ModalManager {
    constructor(ui) {
        this.ui = ui;
        this.currentModal = null;
        this.addModalAnimations();
    }

    createModal(content, width = "400px") {
        const modal = document.createElement("div");
        modal.style.cssText = this.ui.styles.modal(width);
        modal.appendChild(content);
        document.body.appendChild(modal);
        this.currentModal = modal;
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

    closeModal() {
        if (this.currentModal) {
            document.body.removeChild(this.currentModal);
            this.currentModal = null;
        }
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
                this.closeModal();
                const finalResult = tournament.getFinalTableResult(
                    this.ui.game.character,
                    initialResult
                );
                this.ui.tournamentEvents.emit("finalTableResult", finalResult);
            },
            true
        );
        content.appendChild(resultButton);

        this.createModal(content);
    }

    showFinalTableResult(finalResult) {
        const content = document.createElement("div");

        const title = this.createModalTitle(
            this.ui.language.t("finalTable.result")
        );
        content.appendChild(title);

        const info = document.createElement("div");
        info.style.cssText = this.ui.styles.resultInfo;
        info.innerHTML = ModalTemplates.finalTableResultInfo(
            finalResult.result,
            this.ui.language
        );
        content.appendChild(info);

        const closeButton = this.createModalButton(
            this.ui.language.t("confirm"),
            () => {
                this.closeModal();
                this.ui.tournamentState.setState("isPendingFinalTable", false);
                this.ui.updateUI();
            }
        );
        content.appendChild(closeButton);

        this.createModal(content, "500px");
    }

    showResult(result) {
        const content = document.createElement("div");

        const title = this.createModalTitle(
            this.getTournamentResultTitle(result),
            result.prize > 0 ? "rgb(76, 175, 80)" : "#666"
        );
        content.appendChild(title);

        const info = document.createElement("div");
        info.style.cssText = this.ui.styles.resultInfo;
        info.innerHTML = ModalTemplates.resultDetails(result, this.ui.language);
        content.appendChild(info);

        const closeButton = this.createModalButton(
            this.ui.language.t("confirm"),
            () => {
                this.closeModal();
            }
        );
        content.appendChild(closeButton);

        this.createModal(content, "300px");
    }

    getTournamentResultTitle(result) {
        if (result.rank === 1) return this.ui.language.t("victory");
        if (result.prize > 0)
            return this.ui.language.t("rankAchieved", { rank: result.rank });
        return this.ui.language.t("rank", { rank: result.rank });
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
