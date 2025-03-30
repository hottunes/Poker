export class TournamentCard {
    constructor(ui, tournament) {
        this.ui = ui;
        this.tournament = tournament;
        this.element = this.create();
    }

    create() {
        const card = document.createElement("div");
        card.style.cssText = this.ui.styles.tournamentCard;

        const info = this.tournament.getInfo();

        card.appendChild(this.createHeader());
        card.appendChild(this.createDetails(info));
        card.appendChild(this.createEnterButton());

        return card;
    }

    createHeader() {
        const header = document.createElement("div");
        header.style.cssText = this.ui.styles.tournamentHeader;
        header.textContent = this.ui.language.t(
            `tournamentNames.${this.tournament.type}`
        );
        return header;
    }

    createDetails(info) {
        const details = document.createElement("div");
        details.style.fontSize = "14px";
        details.innerHTML = `
            ${this.ui.language.t("buyIn")}: ${
            info.buyIn
        } | ${this.ui.language.t("prize")}: ${info.prizePool}<br>
            ${this.ui.language.t("participants")}: ${info.currentPlayers}/${
            info.maxPlayers
        }
        `;
        return details;
    }

    createEnterButton() {
        const button = document.createElement("button");
        button.style.cssText = this.ui.styles.enterButton(
            this.ui.tournamentState.isPendingFinalTable
        );
        button.textContent = this.ui.language.t("enterButton");
        button.disabled = this.ui.tournamentState.isPendingFinalTable;
        button.onclick = () =>
            this.ui.tournamentEvents.emit("tournamentEnter", this.tournament);
        return button;
    }
}
