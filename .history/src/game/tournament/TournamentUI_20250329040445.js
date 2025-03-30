import { Tournament } from "./Tournament";
import { Language } from "../i18n/Language";
import { UIStyles } from "./styles/UIStyles";
import { ModalManager } from "./components/ModalManager";
import { TournamentCard } from "./components/TournamentCard";
import { LanguageSelector } from "./components/LanguageSelector";
import { TournamentEvents } from "./events/TournamentEvents";
import { TournamentState } from "./state/TournamentState";

export class TournamentUI {
    constructor(game) {
        this.game = game;
        this.language = game.language;
        this.styles = new UIStyles();
        this.tournamentState = new TournamentState();
        this.modalManager = new ModalManager(this);
        this.tournamentEvents = new TournamentEvents(this);
        this.tournaments = [
            new Tournament("online", 100, 1000),
            new Tournament("highroller", 1000, 200),
        ];
        this.game.character.tournament = this.tournaments[0];

        this.initializeUI();
        this.language.addObserver(() => this.updateUI());
    }

    initializeUI() {
        this.container = this.createMainContainer();
        this.languageSelector = new LanguageSelector(this);
        this.updateUI();
    }

    createMainContainer() {
        const container = document.createElement("div");
        container.style.cssText = this.styles.mainContainer;
        document.body.appendChild(container);
        return container;
    }

    updateUI() {
        this.container.innerHTML = "";
        this.container.appendChild(this.createHeader());

        this.tournaments.forEach((tournament) => {
            const card = new TournamentCard(this, tournament);
            this.container.appendChild(card.element);
        });
    }

    createHeader() {
        const header = document.createElement("div");
        header.style.cssText = this.styles.header;

        const title = document.createElement("span");
        title.textContent = this.language.t("tournamentTitle");

        const resetButton = this.createResetButton();

        header.appendChild(title);
        header.appendChild(resetButton);
        return header;
    }

    createResetButton() {
        const button = document.createElement("button");
        button.style.cssText = this.styles.resetButton;
        button.textContent = this.language.t("resetStats.button");
        button.onclick = () => this.tournamentEvents.emit("resetStats");
        return button;
    }
}
