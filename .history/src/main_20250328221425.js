import * as THREE from "three";
import { Game } from "./game/Game.js";
import { Tournament } from "./game/tournament/Tournament";

// 게임 컨테이너 스타일 설정
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
`;

// 어두운 오버레이 추가
const overlay = document.createElement("div");
overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 0;
`;

// 게임 콘텐츠를 위한 컨테이너
const contentContainer = document.createElement("div");
contentContainer.style.cssText = `
    position: relative;
    z-index: 1;
    height: 100%;
`;

gameContainer.appendChild(overlay);
gameContainer.appendChild(contentContainer);
document.body.appendChild(gameContainer);

// 게임 초기화
const game = new Game(contentContainer);
game.start();

// Handle window resize
window.addEventListener("resize", () => {
    game.onResize(window.innerWidth, window.innerHeight);
});

// Remove loading screen
document.getElementById("loading").style.display = "none";
