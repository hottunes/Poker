import { Game } from "./game/Game.js";

// 게임 컨테이너 생성
const container = document.createElement("div");
container.id = "game-container";
document.body.appendChild(container);

// 게임 인스턴스 생성
const game = new Game(container);

// 창 크기 조절 이벤트 처리
window.addEventListener("resize", () => {
    game.onResize(window.innerWidth, window.innerHeight);
});
