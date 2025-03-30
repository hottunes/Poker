export class AudioManager {
    constructor() {
        this.bgm = new Audio("/src/game/asset/sound/boss_of_poker.mp3");
        this.bgm.loop = true;
        this.isPlaying = false;

        // 볼륨 설정
        this.bgm.volume = 0.5;

        // 로컬 스토리지에서 음악 상태 불러오기
        const musicState = localStorage.getItem("bgmState");
        if (musicState === "playing") {
            this.play();
        }
    }

    play() {
        this.bgm.play();
        this.isPlaying = true;
        localStorage.setItem("bgmState", "playing");
    }

    pause() {
        this.bgm.pause();
        this.isPlaying = false;
        localStorage.setItem("bgmState", "paused");
    }

    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
        return this.isPlaying;
    }
}
