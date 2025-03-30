import { translations } from "./translations";

export class Language {
    constructor() {
        this.currentLang = localStorage.getItem("language") || "ko";
        this.translations = translations;
        this.observers = [];
    }

    // 현재 언어 설정 가져오기
    getCurrentLang() {
        return this.currentLang;
    }

    // 언어 변경
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem("language", lang);
            this.notifyObservers();
        }
    }

    // 번역된 텍스트 가져오기
    t(key, params = {}) {
        const keys = key.split(".");
        let value = this.translations[this.currentLang];

        for (const k of keys) {
            value = value[k];
            if (!value) break;
        }

        if (!value) return key;

        // 파라미터 치환
        return value.replace(/\{(\w+)\}/g, (match, param) => {
            return params[param] !== undefined ? params[param] : match;
        });
    }

    // 옵저버 등록
    addObserver(callback) {
        this.observers.push(callback);
    }

    // 옵저버 제거
    removeObserver(callback) {
        this.observers = this.observers.filter((obs) => obs !== callback);
    }

    // 옵저버들에게 변경 알림
    notifyObservers() {
        this.observers.forEach((callback) => callback());
    }
}
