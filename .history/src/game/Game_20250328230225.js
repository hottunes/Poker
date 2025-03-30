import { Language } from "./i18n/Language.js";
import { Character } from "./character/Character.js";
import { CharacterUI } from "./character/CharacterUI.js";
import { TournamentUI } from "./tournament/TournamentUI.js";
import { Tournament } from "./tournament/Tournament.js";
import { AudioManager } from "./audio/AudioManager.js";

export class Game {
    constructor(container) {
        this.container = container;
        this.character = null;
        this.characterUI = null;
        this.tournamentUI = null;
        this.language = null;

        // Initialize audio system
        this.audioManager = new AudioManager();
        this.createMusicButton();
    }

    start() {
        // Create language selector
        const languageSelector = document.createElement("div");
        languageSelector.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1000;
            display: flex;
            gap: 10px;
        `;

        const languages = ["ko", "en", "ja", "zh"];
        languages.forEach((lang) => {
            const button = document.createElement("button");
            button.textContent = lang.toUpperCase();
            button.style.cssText = `
                padding: 5px 10px;
                background: rgba(0, 0, 0, 0.7);
                border: 1px solid #ffd700;
                color: #ffd700;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.2s ease;
            `;
            button.onmouseover = () =>
                (button.style.background = "rgba(255, 215, 0, 0.2)");
            button.onmouseout = () =>
                (button.style.background = "rgba(0, 0, 0, 0.7)");
            button.onclick = () => this.setLanguage(lang);
            languageSelector.appendChild(button);
        });

        this.container.appendChild(languageSelector);

        // Initialize character
        this.character = new Character();
        this.characterUI = new CharacterUI(this.character);
        this.tournamentUI = new TournamentUI(this.character);

        // Set initial language
        this.setLanguage("ko");
    }

    setLanguage(lang) {
        this.language = lang;
        if (this.characterUI) {
            this.characterUI.updateUI();
        }
        if (this.tournamentUI) {
            this.tournamentUI.updateUI();
        }
    }

    createMusicButton() {
        const container = document.createElement("div");
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 1000;
        `;

        // 음악 선택 드롭다운
        const select = document.createElement("select");
        select.style.cssText = `
            padding: 8px;
            background: rgba(0, 0, 0, 0.8);
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            font-family: 'system-ui', sans-serif;
        `;

        this.audioManager.tracks.forEach((track) => {
            const option = document.createElement("option");
            option.value = track.id;
            option.textContent = this.language.t("audio.track", {
                number: track.id,
            });
            option.selected = track.id === this.audioManager.currentTrackId;
            select.appendChild(option);
        });

        select.onchange = (e) => {
            this.audioManager.changeTrack(parseInt(e.target.value));
            updateButtonText(this.audioManager.isPlaying);
        };

        // 재생/일시정지 버튼
        const button = document.createElement("button");
        button.style.cssText = `
            padding: 10px 15px;
            background: rgba(0, 0, 0, 0.8);
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            font-family: 'system-ui', sans-serif;
            display: flex;
            align-items: center;
            gap: 5px;
        `;

        const updateButtonText = (isPlaying) => {
            const currentTrack = this.audioManager.getCurrentTrack();
            button.innerHTML = `
                ${isPlaying ? "🔊" : "🔈"}
                ${this.language.t(
                    "audio." + (isPlaying ? "musicOn" : "musicOff")
                )} - 
                ${this.language.t("audio.track", { number: currentTrack.id })}
            `;
        };

        // 초기 상태 설정
        updateButtonText(this.audioManager.isPlaying);

        // 클릭 이벤트
        button.onclick = () => {
            const isPlaying = this.audioManager.toggle();
            updateButtonText(isPlaying);
        };

        // 언어 변경 이벤트 리스너 추가
        document.addEventListener("languageChanged", () => {
            updateButtonText(this.audioManager.isPlaying);
            // 드롭다운 옵션 텍스트 업데이트
            Array.from(select.options).forEach((option, index) => {
                option.textContent = this.language.t("audio.track", {
                    number: index + 1,
                });
            });
        });

        container.appendChild(select);
        container.appendChild(button);
        document.body.appendChild(container);
    }
}
