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
        this.language = new Language();

        // Initialize audio system
        this.audioManager = new AudioManager();
        this.createMusicButton();
        this.createAdBanner();
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
            left: 20px;
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

    createAdBanner() {
        const banner = document.createElement("div");
        banner.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-family: 'system-ui', sans-serif;
            cursor: pointer;
            transition: transform 0.2s, background-color 0.2s;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        // 이메일 아이콘 추가
        const icon = document.createElement("span");
        icon.textContent = "📧";
        icon.style.fontSize = "20px";

        // 텍스트 컨테이너
        const textContainer = document.createElement("div");
        textContainer.style.cssText = `
            display: flex;
            flex-direction: column;
        `;

        // 광고 문의 텍스트
        const text = document.createElement("div");
        text.style.cssText = `
            font-size: 14px;
            font-weight: bold;
        `;
        text.textContent = "광고 문의";

        // 이메일 주소
        const email = document.createElement("div");
        email.style.cssText = `
            font-size: 12px;
            color: #4CAF50;
        `;
        email.textContent = "contact@example.com";

        // 호버 효과
        banner.onmouseover = () => {
            banner.style.transform = "scale(1.05)";
            banner.style.background = "rgba(0, 0, 0, 0.9)";
        };
        banner.onmouseout = () => {
            banner.style.transform = "scale(1)";
            banner.style.background = "rgba(0, 0, 0, 0.8)";
        };

        // 클릭 이벤트
        banner.onclick = () => {
            window.location.href = "mailto:contact@example.com";
        };

        // 요소들을 배너에 추가
        textContainer.appendChild(text);
        textContainer.appendChild(email);
        banner.appendChild(icon);
        banner.appendChild(textContainer);

        document.body.appendChild(banner);
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
