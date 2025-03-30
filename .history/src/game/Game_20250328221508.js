import * as THREE from "three";
import { Character } from "./character/Character.js";
import { CharacterUI } from "./character/CharacterUI.js";
import { TournamentUI } from "./tournament/TournamentUI.js";
import { Tournament } from "./tournament/Tournament.js";
import { Language } from "./i18n/Language.js";
import { AudioManager } from "./audio/AudioManager";

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

        // Initialize Three.js scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer({ antialias: true });

        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.z = 5;

        // Add basic lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 0);
        this.scene.add(directionalLight);

        // Start animation loop
        this.animate();

        // Add Vibe Jam badge
        this.addVibeJamBadge();
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

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

    onResize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    addVibeJamBadge() {
        const badge = document.createElement("a");
        badge.href = "https://jam.pieter.com";
        badge.target = "_blank";
        badge.style.cssText = `
            font-family: 'system-ui', sans-serif;
            position: fixed;
            bottom: -1px;
            right: -1px;
            padding: 7px;
            font-size: 14px;
            font-weight: bold;
            background: #fff;
            color: #000;
            text-decoration: none;
            z-index: 10000;
            border-top-left-radius: 12px;
            border: 1px solid #fff;
        `;
        badge.textContent = "🕹️ Vibe Jam 2025";
        document.body.appendChild(badge);
    }
}
