export class TournamentEvents {
    constructor() {
        this.events = {};
    }

    // 이벤트 리스너 등록
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    // 이벤트 발생
    emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach((callback) => callback(data));
        }
    }

    // 이벤트 리스너 제거
    off(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(
                (cb) => cb !== callback
            );
        }
    }

    // 모든 이벤트 리스너 제거
    clear() {
        this.events = {};
    }
}
