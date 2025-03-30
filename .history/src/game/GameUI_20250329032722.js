import { CharacterUI } from "./character/CharacterUI.js";

export class GameUI {
    constructor(game) {
        this.game = game;
        this.container = document.createElement("div");
        document.body.appendChild(this.container);

        // 캐릭터 프로필 UI 생성
        this.characterUI = new CharacterUI(
            this.game.character,
            this.game.language
        );
        this.characterUI.mount(this.container);

        // 토너먼트 UI 생성
        this.tournamentUI = new TournamentUI(
            this.game.tournament,
            this.game.character,
            this.game.language
        );
        this.tournamentUI.mount(this.container);
    }

    unmount() {
        if (this.characterUI) {
            this.characterUI.unmount();
        }
        if (this.tournamentUI) {
            this.tournamentUI.unmount();
        }
        if (this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
    }
}
