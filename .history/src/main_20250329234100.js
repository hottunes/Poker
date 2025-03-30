import { Game } from "./game/Game.js";

// Create game container with background
const gameContainer = document.createElement("div");
gameContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('/images/image.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
`;

// Create dark overlay for better UI readability
const overlay = document.createElement("div");
overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
`;

// Create content container
const contentContainer = document.createElement("div");
contentContainer.style.cssText = `
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
`;

// Append overlay and content container to game container
gameContainer.appendChild(overlay);
gameContainer.appendChild(contentContainer);

// Append game container to body
document.body.appendChild(gameContainer);

// Initialize game with content container
const game = new Game(contentContainer);

// Handle window resize
window.addEventListener("resize", () => {
    game.onResize(window.innerWidth, window.innerHeight);
});

// Remove loading screen
document.getElementById("loading").style.display = "none";

// 언어 선택 UI 생성
const languageSelector = document.createElement("div");
languageSelector.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 10px;
    z-index: 1000;
`;

["ko", "en", "ja", "zh"].forEach((lang) => {
    const button = document.createElement("button");
    button.textContent = game.getLanguageLabel(lang);
    button.style.cssText = `
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.8);
        border: none;
        border-radius: 5px;
        color: white;
        cursor: pointer;
        font-family: 'system-ui', sans-serif;
    `;

    button.onmouseover = () => {
        button.style.background = "rgba(0, 0, 0, 0.9)";
    };

    button.onmouseout = () => {
        button.style.background = "rgba(0, 0, 0, 0.8)";
    };

    button.onclick = () => {
        game.language.setLanguage(lang);
    };

    languageSelector.appendChild(button);
});

document.body.appendChild(languageSelector);
