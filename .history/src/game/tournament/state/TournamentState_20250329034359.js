export class TournamentState {
    constructor() {
        this.isPendingFinalTable = false;
        this.currentTournament = null;
        this.observers = new Set();
    }

    setState(key, value) {
        this[key] = value;
        this.notifyObservers();
    }

    addObserver(observer) {
        this.observers.add(observer);
    }

    removeObserver(observer) {
        this.observers.delete(observer);
    }

    notifyObservers() {
        this.observers.forEach((observer) => observer(this));
    }
}
