import { Game } from "./game/Game.js";

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
    display: flex;
    flex-direction: column;
`;

// Append elements
gameContainer.appendChild(overlay);
gameContainer.appendChild(contentContainer);
document.body.appendChild(gameContainer);

// Initialize game
const game = new Game(contentContainer);
game.start();

// Handle window resize
window.addEventListener("resize", () => {
    game.onResize(window.innerWidth, window.innerHeight);
});

// Remove loading screen
document.getElementById("loading").style.display = "none";
