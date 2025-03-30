import { styles } from "../styles/styles";

export class TournamentCard {
    constructor(tournament, language, isPendingFinalTable, onEnterClick) {
        this.tournament = tournament;
        this.language = language;
        this.isPendingFinalTable = isPendingFinalTable;
        this.onEnterClick = onEnterClick;
    }

    render() {
        const card = document.createElement("div");
        card.style.cssText = styles.tournamentCard;

        const info = this.tournament.getInfo();

        card.appendChild(this.createHeader());
        card.appendChild(this.createDetails(info));
        card.appendChild(this.createEnterButton());

        return card;
    }

    createHeader() {
        const header = document.createElement("div");
        header.style.cssText = styles.tournamentHeader;
        header.textContent = this.language.t(
            `tournamentNames.${this.tournament.type}`
        );
        return header;
    }

    createDetails(info) {
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
        return details;
    }

    createEnterButton() {
        const button = document.createElement("button");
        button.style.cssText = styles.enterButton(this.isPendingFinalTable);
        button.textContent = this.language.t("enterButton");
        button.disabled = this.isPendingFinalTable;
        button.onclick = () => this.onEnterClick(this.tournament);
        return button;
    }
}
