export class TournamentEvents {
    constructor(ui) {
        this.ui = ui;
        this.handlers = new Map();
        this.initializeEvents();
    }

    initializeEvents() {
        this.on("tournamentEnter", this.handleTournamentEnter.bind(this));
        this.on(
            "finalTableQualification",
            this.handleFinalTableQualification.bind(this)
        );
        this.on("finalTableResult", this.handleFinalTableResult.bind(this));
        this.on("resetStats", this.handleResetStats.bind(this));
    }

    on(event, handler) {
        this.handlers.set(event, handler);
    }

    emit(event, data) {
        const handler = this.handlers.get(event);
        if (handler) handler(data);
    }

    handleTournamentEnter(tournament) {
        if (this.ui.tournamentState.isPendingFinalTable) return;

        const result = tournament.enter(this.ui.game.character);
        if (!result.success) {
            alert(result.message);
            return;
        }

        if (result.finalTable) {
            this.emit("finalTableQualification", { tournament, result });
        } else {
            this.ui.modalManager.showResult(result.result);
        }
    }

    handleFinalTableQualification({ tournament, result }) {
        this.ui.tournamentState.setState("isPendingFinalTable", true);
        this.ui.updateUI();
        this.ui.modalManager.showFinalTableQualification(
            tournament,
            result.result
        );
    }

    handleFinalTableResult(finalResult) {
        this.ui.modalManager.showFinalTableResult(finalResult);
    }

    handleResetStats() {
        if (confirm(this.ui.language.t("resetStats.confirm"))) {
            this.ui.game.character.tournament.resetStats();
            alert(this.ui.language.t("resetStats.complete"));
        }
    }
}
