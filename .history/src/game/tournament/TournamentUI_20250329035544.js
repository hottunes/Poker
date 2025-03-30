import { Tournament } from "./core/Tournament";
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
        this.modalManager = new ModalManager(this);
        this.tournaments = [
            new Tournament("online", 100, 1000),
            new Tournament("highroller", 1000, 200),
        ];
        this.tournamentState = new TournamentState();
        this.game.character.tournament = this.tournaments[0];

        this.initializeUI();
        this.language.addObserver(() => this.updateUI());
        this.tournamentEvents = new TournamentEvents(this);
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
        button.onclick = () => this.handleResetStats();
        return button;
    }

    handleEnterClick(tournament) {
        if (this.tournamentState.isPendingFinalTable) return;

        const result = tournament.enter(this.game.character);
        if (!result.success) {
            alert(result.message);
            return;
        }

        if (result.finalTable) {
            this.tournamentState.setState("isPendingFinalTable", true);
            this.updateUI();
            this.modalManager.showFinalTableQualification(
                tournament,
                result.result
            );
        } else {
            this.modalManager.showResult(result.result);
        }
    }

    handleResetStats() {
        if (confirm(this.language.t("resetStats.confirm"))) {
            this.game.character.tournament.resetStats();
            alert(this.language.t("resetStats.complete"));
        }
    }
}
