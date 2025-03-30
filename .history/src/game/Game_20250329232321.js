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
        this.language = new Language();
        this.character = new Character(); // Character 초기화를 먼저 수행
        this.characterUI = null;
        this.tournamentUI = null;
        this.characterProfile = null;

        // Initialize audio system
        this.audioManager = new AudioManager();
        this.createMusicButton();
        this.createAdvertisementLink();

        // 프로필 설정 모달 표시
        this.showProfileSetupModal();
    }

    start() {
        this.showNameInputModal();
    }

    showNameInputModal() {
        const modal = document.createElement("div");
        modal.className = "modal";
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        modal.style.zIndex = "1000";

        const content = document.createElement("div");
        content.className = "modal-content";
        content.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
        content.style.padding = "2.5rem";
        content.style.borderRadius = "12px";
        content.style.maxWidth = "360px";
        content.style.width = "90%";
        content.style.textAlign = "center";
        content.style.boxSizing = "border-box";

        const title = document.createElement("h2");
        title.textContent = this.language.t("nameInput.title");
        title.style.marginBottom = "1.5rem";
        title.style.color = "#4CAF50";
        title.style.fontSize = "28px";
        title.style.fontWeight = "bold";

        const description = document.createElement("p");
        description.textContent = this.language.t("nameInput.description");
        description.style.color = "rgba(255, 255, 255, 0.8)";
        description.style.fontSize = "16px";

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = this.language.t("nameInput.placeholder");
        input.style.width = "100%";
        input.style.padding = "0.8rem 1rem";
        input.style.marginTop = "1.5rem";
        input.style.marginBottom = "1.5rem";
        input.style.border = "2px solid #4CAF50";
        input.style.borderRadius = "6px";
        input.style.fontSize = "16px";
        input.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
        input.style.color = "white";
        input.style.outline = "none";
        input.style.boxSizing = "border-box";

        const startButton = document.createElement("button");
        startButton.textContent = this.language.t("nameInput.start");
        startButton.style.padding = "0.8rem 0";
        startButton.style.width = "100%";
        startButton.style.backgroundColor = "#4CAF50";
        startButton.style.color = "white";
        startButton.style.border = "none";
        startButton.style.borderRadius = "6px";
        startButton.style.cursor = "pointer";
        startButton.style.fontSize = "16px";
        startButton.style.fontWeight = "bold";
        startButton.style.transition = "transform 0.2s";

        startButton.onmouseover = () => {
            startButton.style.transform = "scale(1.05)";
        };
        startButton.onmouseout = () => {
            startButton.style.transform = "scale(1)";
        };

        const errorMessage = document.createElement("p");
        errorMessage.style.color = "#ff4444";
        errorMessage.style.marginTop = "0.5rem";
        errorMessage.style.display = "none";

        startButton.addEventListener("click", () => {
            const name = input.value.trim();
            if (name) {
                this.playerName = name;
                modal.remove();
                this.initializeGame();
            } else {
                errorMessage.textContent = this.language.t("nameInput.error");
                errorMessage.style.display = "block";
            }
        });

        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                startButton.click();
            }
        });

        content.appendChild(title);
        content.appendChild(description);
        content.appendChild(input);
        content.appendChild(startButton);
        content.appendChild(errorMessage);
        modal.appendChild(content);
        document.body.appendChild(modal);
    }

    initializeGame() {
        // 캐릭터 생성
        this.character = new Character(this.playerName, "aggressive");

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

    createAdvertisementLink() {
        const link = document.createElement("a");
        link.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px 20px;
            border-radius: 8px;
            color: #FFD700;
            text-decoration: none;
            font-family: 'system-ui', sans-serif;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            transition: all 0.3s ease;
            z-index: 1000;
            border: 1px solid #FFD700;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        `;

        const title = document.createElement("div");
        title.style.cssText = `
            font-weight: bold;
            color: #FFD700;
            font-size: 16px;
            text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
        `;

        const description = document.createElement("div");
        description.style.cssText = `
            font-size: 12px;
            color: #FFF8DC;
        `;

        // 초기 텍스트 설정
        const updateText = () => {
            title.textContent = this.language.t("advertisement.title");
            description.textContent = this.language.t(
                "advertisement.description"
            );
        };
        updateText();

        link.appendChild(title);
        link.appendChild(description);

        // 구글 폼 링크로 변경
        link.href =
            "https://docs.google.com/forms/d/e/1FAIpQLSdsJnaFOHuLLMQFTZpBY4MostnwxwiViblt_KDW-Z-ekLD4Pw/viewform?usp=header";
        link.target = "_blank";

        // 호버 효과
        link.onmouseover = () => {
            link.style.transform = "scale(1.05)";
            link.style.boxShadow = "0 0 15px rgba(255, 215, 0, 0.5)";
            link.style.background = "rgba(0, 0, 0, 0.9)";
        };
        link.onmouseout = () => {
            link.style.transform = "scale(1)";
            link.style.boxShadow = "0 0 10px rgba(255, 215, 0, 0.3)";
            link.style.background = "rgba(0, 0, 0, 0.8)";
        };

        // 언어 변경 이벤트 리스너 추가
        document.addEventListener("languageChanged", updateText);

        // 문서에 링크 추가
        document.body.appendChild(link);
    }

    showProfileSetupModal() {
        const modal = document.createElement("div");
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 3000;
        `;

        const content = document.createElement("div");
        content.style.cssText = `
            background: #1a1a1a;
            padding: 30px;
            border-radius: 15px;
            width: 90%;
            max-width: 500px;
            text-align: center;
            color: white;
        `;

        // 제목
        const title = document.createElement("h2");
        title.textContent = this.language.t("profile.setup");
        title.style.cssText = `
            font-size: 24px;
            margin-bottom: 20px;
            color: #FFD700;
        `;
        content.appendChild(title);

        // 닉네임 입력
        const nicknameInput = document.createElement("input");
        nicknameInput.type = "text";
        nicknameInput.placeholder = this.language.t("profile.enterNickname");
        nicknameInput.style.cssText = `
            width: 100%;
            padding: 10px;
            margin-bottom: 20px;
            background: #333;
            border: none;
            border-radius: 5px;
            color: white;
            font-size: 16px;
        `;
        content.appendChild(nicknameInput);

        // 프로필 이미지 선택
        const imageContainer = document.createElement("div");
        imageContainer.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 20px;
        `;

        let selectedImage = null;

        // 프로필 이미지 옵션들
        for (let i = 1; i <= 3; i++) {
            const imageWrapper = document.createElement("div");
            imageWrapper.style.cssText = `
                cursor: pointer;
                border-radius: 10px;
                padding: 5px;
                transition: all 0.3s;
            `;

            const img = document.createElement("img");
            img.src = `images/player/player_0${i}.png`;
            img.style.cssText = `
                width: 100px;
                height: 100px;
                border-radius: 50%;
                object-fit: cover;
            `;

            imageWrapper.onclick = () => {
                // 이전 선택 제거
                imageContainer.querySelectorAll("div").forEach((wrapper) => {
                    wrapper.style.background = "none";
                });
                // 현재 선택 표시
                imageWrapper.style.background = "rgba(76, 175, 80, 0.3)";
                selectedImage = i;
            };

            imageWrapper.appendChild(img);
            imageContainer.appendChild(imageWrapper);
        }
        content.appendChild(imageContainer);

        // 시작 버튼
        const startButton = document.createElement("button");
        startButton.textContent = this.language.t("profile.start");
        startButton.style.cssText = `
            padding: 10px 30px;
            background: #4CAF50;
            border: none;
            border-radius: 5px;
            color: white;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
        `;
        startButton.onmouseover = () =>
            (startButton.style.background = "#45a049");
        startButton.onmouseout = () =>
            (startButton.style.background = "#4CAF50");
        startButton.onclick = () => {
            const nickname = nicknameInput.value.trim();
            if (!nickname) {
                alert(this.language.t("profile.nicknameRequired"));
                return;
            }
            if (!selectedImage) {
                alert(this.language.t("profile.imageRequired"));
                return;
            }

            // 프로필 정보 저장
            this.character.setProfile(nickname, selectedImage);
            document.body.removeChild(modal);

            // 게임 초기화
            this.initializeGame();
        };
        content.appendChild(startButton);

        modal.appendChild(content);
        document.body.appendChild(modal);
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
