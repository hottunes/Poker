import { Game } from "./game/Game.js";
import { translations } from "./translations.js";

// Create game container
const gameContainer = document.createElement("div");
gameContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('/images/background.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    z-index: 1;
`;

// Create dark overlay
const overlay = document.createElement("div");
overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 2;
`;

// Create content container
const contentContainer = document.createElement("div");
contentContainer.style.cssText = `
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 3;
`;

// Append elements
gameContainer.appendChild(overlay);
gameContainer.appendChild(contentContainer);
document.body.appendChild(gameContainer);

// Initialize game
const game = new Game(contentContainer);
game.start();

// Language selection
const languageSelect = document.createElement("select");
languageSelect.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    padding: 5px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border: 1px solid #ffd700;
    border-radius: 5px;
`;

const languages = ["ko", "en", "ja", "zh"];
languages.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang;
    option.textContent = lang.toUpperCase();
    languageSelect.appendChild(option);
});

document.body.appendChild(languageSelect);

// Update ad banner text based on language
function updateAdBanner(language) {
    const adBanner = document.getElementById("ad-banner");
    if (adBanner) {
        const t = translations[language].ad;
        adBanner.querySelector("h3").textContent = t.title;
        adBanner.querySelectorAll("p")[0].textContent = t.description;
        adBanner.querySelectorAll("p")[1].textContent = t.contact;
    }
}

// Language change handler
languageSelect.addEventListener("change", (e) => {
    const selectedLanguage = e.target.value;
    game.setLanguage(selectedLanguage);
    updateAdBanner(selectedLanguage);
});

// Initialize ad banner with default language
updateAdBanner("ko");

// Handle window resize
window.addEventListener("resize", () => {
    game.onResize(window.innerWidth, window.innerHeight);
});

// Remove loading screen
document.getElementById("loading").style.display = "none";
