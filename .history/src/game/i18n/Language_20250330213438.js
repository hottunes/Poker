import { translations } from "./translations";

export class Language {
    constructor() {
        this.currentLang = "ko";
        this.observers = [];
    }

    translations = {
        ko: {
            tournamentTitle: "진행 중인 토너먼트",
            tournamentNames: {
                online: "온라인 스페셜",
                highroller: "하이롤러",
            },
            buyIn: "참가비",
            prize: "상금",
            participants: "참가자",
            enterButton: "참가하기",
            portal: {
                title: "VIBEVERSE PORTAL",
                returnToPrevious: "Return to Previous Game",
                clickToNext: "Go to Next Game →",
                clickToReturn: "← Click to Return",
            },
        },
        en: {
            tournamentTitle: "Active Tournaments",
            tournamentNames: {
                online: "Online Special",
                highroller: "High Roller",
            },
            buyIn: "Buy-in",
            prize: "Prize Pool",
            participants: "Players",
            enterButton: "Enter",
            portal: {
                title: "VIBEVERSE PORTAL",
                returnToPrevious: "Return to Previous Game",
                clickToNext: "Go to Next Game →",
                clickToReturn: "← Click to Return",
            },
        },
        ja: {
            tournamentTitle: "開催中のトーナメント",
            tournamentNames: {
                online: "オンラインスペシャル",
                highroller: "ハイローラー",
            },
            buyIn: "参加費",
            prize: "賞金",
            participants: "参加者",
            enterButton: "参加する",
            portal: {
                title: "VIBEVERSE PORTAL",
                returnToPrevious: "前のゲームに戻る",
                clickToNext: "次のゲームへ →",
                clickToReturn: "← クリックして戻る",
            },
        },
        zh: {
            tournamentTitle: "进行中的比赛",
            tournamentNames: {
                online: "在线特别赛",
                highroller: "高额赛事",
            },
            buyIn: "买入",
            prize: "奖池",
            participants: "参赛者",
            enterButton: "参加",
            portal: {
                title: "VIBEVERSE PORTAL",
                returnToPrevious: "返回上个游戏",
                clickToNext: "前往下个游戏 →",
                clickToReturn: "← 点击返回",
            },
        },
    };

    // 현재 언어 설정 가져오기
    getCurrentLang() {
        return this.currentLang;
    }

    // 언어 변경
    setLanguage(lang) {
        this.currentLang = lang;
        // 언어 변경 이벤트 발생
        const event = new Event("languageChanged");
        document.dispatchEvent(event);
        // 옵저버들에게 알림
        this.notifyObservers();
    }

    // 번역된 텍스트 가져오기
    t(key) {
        const keys = key.split(".");
        let value = this.translations[this.currentLang];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key; // 번역이 없는 경우 키를 반환
            }
        }

        return value;
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
