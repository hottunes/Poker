import { Tournament } from "./Tournament";
import { Language } from "../i18n/Language";
import { styles } from "./styles/styles";
import { LanguageSelector } from "./components/LanguageSelector";
import { TournamentCard } from "./components/TournamentCard";
import { FinalTableModal } from "./modals/FinalTableModal";
import { ResultModal } from "./modals/ResultModal";

export class TournamentUI {
    constructor(game) {
        this.game = game;
        this.language = game.language;
        this.tournaments = [
            new Tournament("online", 100, 1000),
            new Tournament("highroller", 1000, 200),
        ];
        this.isPendingFinalTable = false;
        this.game.character.tournament = this.tournaments[0];

        this.initializeUI();
        this.language.addObserver(() => this.updateUI());
    }

    initializeUI() {
        this.container = this.createMainContainer();
        this.languageSelector = new LanguageSelector(this.language);
        this.updateUI();
    }

    createMainContainer() {
        const container = document.createElement("div");
        container.style.cssText = styles.mainContainer;
        document.body.appendChild(container);
        return container;
    }

    createHeader() {
        const header = document.createElement("div");
        header.style.cssText = styles.header;

        const title = document.createElement("span");
        title.textContent = this.language.t("tournamentTitle");

        const resetButton = this.createResetButton();

        header.appendChild(title);
        header.appendChild(resetButton);
        return header;
    }

    createResetButton() {
        const button = document.createElement("button");
        button.style.cssText = styles.resetButton;
        button.textContent = this.language.t("resetStats.button");
        button.onclick = () => this.handleResetStats();
        return button;
    }

    handleResetStats() {
        if (confirm(this.language.t("resetStats.confirm"))) {
            this.game.character.tournament.resetStats();
            alert(this.language.t("resetStats.complete"));
        }
    }

    handleEnterClick(tournament) {
        if (this.isPendingFinalTable) return;

        const result = tournament.enter(this.game.character);
        if (!result.success) {
            alert(result.message);
            return;
        }

        if (result.finalTable) {
            this.isPendingFinalTable = true;
            this.updateUI();

            const finalTableModal = new FinalTableModal(this.language, () => {
                this.isPendingFinalTable = false;
                this.updateUI();
            });
            finalTableModal.showQualification(tournament, result.result);
        } else {
            const resultModal = new ResultModal(this.language);
            resultModal.show(result.result);
        }
    }

    updateUI() {
        this.container.innerHTML = "";
        this.container.appendChild(this.createHeader());

        this.tournaments.forEach((tournament) => {
            const card = new TournamentCard(
                tournament,
                this.language,
                this.isPendingFinalTable,
                (t) => this.handleEnterClick(t)
            );
            this.container.appendChild(card.render());
        });
    }
}
