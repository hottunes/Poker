import { Language } from "./i18n/Language.js";
import { Character } from "./character/Character.js";
import { CharacterUI } from "./character/CharacterUI.js";
import { TournamentUI } from "./tournament/TournamentUI.js";
import { Tournament } from "./tournament/Tournament.js";

export class Game {
    constructor(container) {
        this.container = container;
        this.character = null;
        this.characterUI = null;
        this.tournamentUI = null;
        this.language = new Language();
    }

    start() {
        // 캐릭터 생성
        this.character = new Character("Player", "aggressive");

        // 토너먼트 초기화
        this.character.tournament = new Tournament("online", 100, 1000);

        // UI 초기화
        this.characterUI = new CharacterUI(this.character, this.language);
        this.tournamentUI = new TournamentUI(this);

        // 언어 선택 버튼 생성
        this.createLanguageButtons();

        // 컨테이너에 UI 요소들 추가
        this.container.appendChild(this.characterUI.container);
        this.container.appendChild(this.tournamentUI.container);
    }

    createLanguageButtons() {
        const languages = ["ko", "en", "ja", "zh"];
        const buttonContainer = document.createElement("div");
        buttonContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
            z-index: 1000;
        `;

        languages.forEach((lang) => {
            const button = document.createElement("button");
            button.textContent = this.getLanguageLabel(lang);
            button.style.cssText = `
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                background: ${
                    this.language.getCurrentLang() === lang
                        ? "#4CAF50"
                        : "rgba(0, 0, 0, 0.5)"
                };
                color: white;
                cursor: pointer;
                font-family: 'system-ui', sans-serif;
                transition: background-color 0.3s;
            `;

            button.onmouseover = () => {
                if (this.language.getCurrentLang() !== lang) {
                    button.style.background = "rgba(76, 175, 80, 0.5)";
                }
            };

            button.onmouseout = () => {
                if (this.language.getCurrentLang() !== lang) {
                    button.style.background = "rgba(0, 0, 0, 0.5)";
                }
            };

            button.onclick = () => {
                this.language.setLanguage(lang);
                document
                    .querySelectorAll(buttonContainer.tagName + " button")
                    .forEach((btn) => {
                        btn.style.background = "rgba(0, 0, 0, 0.5)";
                    });
                button.style.background = "#4CAF50";
            };

            buttonContainer.appendChild(button);
        });

        this.container.appendChild(buttonContainer);
    }

    getLanguageLabel(lang) {
        const labels = {
            ko: "한국어",
            en: "English",
            ja: "日本語",
            zh: "中文",
        };
        return labels[lang] || lang;
    }
}
