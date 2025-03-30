export class TournamentCard {
    constructor(ui, tournament) {
        this.ui = ui;
        this.tournament = tournament;
        this.element = this.create();
    }

    create() {
        const card = document.createElement("div");
        card.style.cssText = this.ui.styles.tournamentCard;

        card.appendChild(this.createHeader());
        card.appendChild(this.createDetails());
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

    createDetails() {
        const details = document.createElement("div");
        details.style.fontSize = "14px";
        const info = this.tournament.getInfo();
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
            this.ui.isPendingFinalTable
        );
        button.textContent = this.ui.language.t("enterButton");
        button.disabled = this.ui.isPendingFinalTable;
        button.onclick = () => this.ui.handleEnterClick(this.tournament);
        return button;
    }
}
