import { Game } from "./game/Game.js";

// Create game container with background
const gameContainer = document.createElement("div");
gameContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('images/image.png');
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
