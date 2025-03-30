import { Language } from "./i18n/Language.js";
import { Character } from "./character/Character.js";
import { CharacterUI } from "./character/CharacterUI.js";
import { TournamentUI } from "./tournament/TournamentUI.js";
import { Tournament } from "./tournament/Tournament.js";
import { AudioManager } from "./audio/AudioManager.js";
import { CharacterProfile } from "./character/CharacterProfile.js";

export class Game {
    constructor(container) {
        this.container = container;
        this.character = null;
        this.characterUI = null;
        this.tournamentUI = null;
        this.characterProfile = null;
        this.language = new Language();
        this.audio = new AudioManager();
        this.backgroundMusic = new Audio("assets/audio/background.mp3");
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.5;
        this.backgroundMusic.play().catch((error) => {
            console.log("Audio playback failed:", error);
        });

        // Initialize audio system
        this.audioManager = new AudioManager();
        this.createMusicButton();
        this.createAdBanner();
    }

    start() {
        this.showNameInputModal();
    }

    showNameInputModal() {
        const modal = document.createElement("div");
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        const content = document.createElement("div");
        content.style.cssText = `
            background: rgba(0, 0, 0, 0.9);
            padding: 30px;
            border-radius: 15px;
            color: white;
            text-align: center;
            min-width: 300px;
            max-width: 90%;
            animation: fadeIn 0.5s;
        `;

        // 제목
        const title = document.createElement("div");
        title.style.cssText = `
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: rgb(76, 175, 80);
        `;
        title.textContent = this.language.t("nameInput.title");
        content.appendChild(title);

        // 설명
        const description = document.createElement("div");
        description.style.cssText = `
            font-size: 16px;
            margin-bottom: 20px;
            color: rgba(255, 255, 255, 0.8);
        `;
        description.textContent = this.language.t("nameInput.description");
        content.appendChild(description);

        // 이름 입력 필드
        const input = document.createElement("input");
        input.type = "text";
        input.style.cssText = `
            width: 100%;
            padding: 10px;
            margin-bottom: 20px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgb(76, 175, 80);
            border-radius: 5px;
            color: white;
            font-size: 16px;
            outline: none;
            font-family: 'system-ui', sans-serif;
        `;
        input.placeholder = this.language.t("nameInput.placeholder");
        content.appendChild(input);

        // 시작 버튼
        const button = document.createElement("button");
        button.style.cssText = `
            padding: 12px 30px;
            background: rgb(76, 175, 80);
            border: none;
            border-radius: 5px;
            color: white;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s;
            font-family: 'system-ui', sans-serif;
        `;
        button.textContent = this.language.t("nameInput.start");

        // 버튼 호버 효과
        button.onmouseover = () => {
            button.style.transform = "scale(1.05)";
        };
        button.onmouseout = () => {
            button.style.transform = "scale(1)";
        };

        // 시작 버튼 클릭 이벤트
        button.onclick = () => {
            const name = input.value.trim();
            if (name) {
                this.initializeGame(name);
                document.body.removeChild(modal);
            } else {
                alert(this.language.t("nameInput.error"));
            }
        };

        // Enter 키 이벤트
        input.onkeypress = (e) => {
            if (e.key === "Enter") {
                button.click();
            }
        };

        content.appendChild(button);
        modal.appendChild(content);
        document.body.appendChild(modal);

        // 애니메이션 스타일 추가
        const style = document.createElement("style");
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);

        // 입력 필드에 포커스
        input.focus();
    }

    initializeGame(name) {
        // 캐릭터 생성
        this.character = new Character(name, "aggressive");

        // 토너먼트 초기화
        this.character.tournament = new Tournament("online", 100, 1000);

        // UI 초기화
        this.characterUI = new CharacterUI(this.character, this.language);
        this.tournamentUI = new TournamentUI(this);
        this.characterProfile = new CharacterProfile(
            this.character,
            this.language
        );

        // 컨테이너에 UI 요소들 추가
        this.container.appendChild(this.characterUI.container);
        this.container.appendChild(this.tournamentUI.container);
        this.container.appendChild(this.characterProfile.container);

        // 언어 변경 이벤트 리스너 추가
        document.addEventListener("languageChanged", () => {
            this.characterProfile.update();
        });
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

        // 음악 컨트롤 컨테이너
        const controlsContainer = document.createElement("div");
        controlsContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px;
            border-radius: 5px;
        `;

        // 음악 선택 드롭다운
        const select = document.createElement("select");
        select.style.cssText = `
            padding: 8px;
            background: rgba(255, 255, 255, 0.1);
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
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            font-family: 'system-ui', sans-serif;
            display: flex;
            align-items: center;
            gap: 5px;
        `;

        // 볼륨 컨트롤 컨테이너
        const volumeContainer = document.createElement("div");
        volumeContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 5px;
        `;

        // 볼륨 아이콘
        const volumeIcon = document.createElement("span");
        volumeIcon.textContent = "🔊";
        volumeIcon.style.fontSize = "16px";

        // 볼륨 슬라이더
        const volumeSlider = document.createElement("input");
        volumeSlider.type = "range";
        volumeSlider.min = "0";
        volumeSlider.max = "100";
        volumeSlider.value = "50";
        volumeSlider.style.cssText = `
            width: 100px;
            height: 4px;
            -webkit-appearance: none;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            outline: none;
        `;

        // 볼륨 슬라이더 스타일링
        volumeSlider.style.background = `
            linear-gradient(to right, 
                rgb(76, 175, 80) ${volumeSlider.value}%, 
                rgba(255, 255, 255, 0.2) ${volumeSlider.value}%
            )
        `;

        // 볼륨 슬라이더 이벤트
        volumeSlider.addEventListener("input", (e) => {
            const value = e.target.value;
            volumeSlider.style.background = `
                linear-gradient(to right, 
                    rgb(76, 175, 80) ${value}%, 
                    rgba(255, 255, 255, 0.2) ${value}%
                )
            `;
            this.audioManager.setVolume(value / 100);
            // 음소거 상태에 따라 아이콘 업데이트
            volumeIcon.textContent = value === "0" ? "🔇" : "🔊";
        });

        const updateButtonText = (isPlaying) => {
            button.innerHTML = isPlaying ? "⏸️" : "▶️";
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

        // 초기 볼륨 상태 설정
        const initialVolume = this.audioManager.getVolume() * 100;
        volumeSlider.value = initialVolume;
        volumeSlider.style.background = `
            linear-gradient(to right, 
                rgb(76, 175, 80) ${initialVolume}%, 
                rgba(255, 255, 255, 0.2) ${initialVolume}%
            )
        `;
        volumeIcon.textContent = initialVolume === 0 ? "🔇" : "🔊";

        // 컨트롤 요소들을 컨테이너에 추가
        volumeContainer.appendChild(volumeIcon);
        volumeContainer.appendChild(volumeSlider);
        controlsContainer.appendChild(select);
        controlsContainer.appendChild(button);
        controlsContainer.appendChild(volumeContainer);
        container.appendChild(controlsContainer);
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

        // 이메일 주소
        const email = document.createElement("div");
        email.style.cssText = `
            font-size: 12px;
            color: #4CAF50;
        `;

        // 텍스트 업데이트 함수
        const updateText = () => {
            text.textContent = this.language.t("adInquiry.title");
            email.textContent = this.language.t("adInquiry.email");
        };

        // 초기 텍스트 설정
        updateText();

        // 언어 변경 이벤트 리스너 추가
        document.addEventListener("languageChanged", updateText);

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
            window.location.href =
                "mailto:" + this.language.t("adInquiry.email");
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
