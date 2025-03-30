import * as THREE from "three";
import { Game } from "./game/Game";
import { Tournament } from "./game/tournament/Tournament";

// Initialize the game
const game = new Game();

// Handle window resize
window.addEventListener("resize", () => {
    game.onResize(window.innerWidth, window.innerHeight);
});

// Remove loading screen
document.getElementById("loading").style.display = "none";
