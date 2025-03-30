export class TournamentState {
    constructor() {
        this.state = {
            isPendingFinalTable: false,
            currentLanguage: "ko",
            tournaments: [],
            selectedTournament: null,
        };
        this.observers = new Set();
    }

    // 상태 가져오기
    getState(key) {
        return this.state[key];
    }

    // 상태 설정하기
    setState(key, value) {
        this.state[key] = value;
        this.notifyObservers();
    }

    // 전체 상태 가져오기
    getFullState() {
        return { ...this.state };
    }

    // 상태 초기화
    reset() {
        this.state = {
            isPendingFinalTable: false,
            currentLanguage: "ko",
            tournaments: [],
            selectedTournament: null,
        };
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
