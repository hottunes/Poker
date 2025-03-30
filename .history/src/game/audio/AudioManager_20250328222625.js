export class AudioManager {
    constructor() {
        this.tracks = [
            { id: 1, name: "Track 1", file: "boss_of_poker_01.mp3" },
            { id: 2, name: "Track 2", file: "boss_of_poker_02.mp3" },
            { id: 3, name: "Track 3", file: "boss_of_poker_03.mp3" },
            { id: 4, name: "Track 4", file: "boss_of_poker_04.mp3" },
        ];

        this.currentTrackId =
            parseInt(localStorage.getItem("currentTrackId")) || 1;
        this.isPlaying = localStorage.getItem("musicPlaying") === "true";
        this.audio = null;

        this.initializeAudio();
    }

    initializeAudio() {
        const track = this.tracks.find((t) => t.id === this.currentTrackId);
        if (!track) return;

        if (this.audio) {
            this.audio.pause();
            this.audio = null;
        }

        this.audio = new Audio(`/src/game/asset/sound/${track.file}`);
        this.audio.loop = false;
        this.audio.volume = 0.5;

        this.audio.addEventListener("ended", () => {
            this.playNextTrack();
        });

        if (this.isPlaying) {
            this.play();
        }
    }

    playNextTrack() {
        const currentIndex = this.tracks.findIndex(
            (t) => t.id === this.currentTrackId
        );
        const nextTrackId =
            currentIndex === this.tracks.length - 1
                ? 1
                : this.tracks[currentIndex + 1].id;
        this.changeTrack(nextTrackId);
    }

    play() {
        if (this.audio) {
            this.audio.play();
            this.isPlaying = true;
            localStorage.setItem("musicPlaying", "true");
        }
    }

    pause() {
        if (this.audio) {
            this.audio.pause();
            this.isPlaying = false;
            localStorage.setItem("musicPlaying", "false");
        }
    }

    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
        return this.isPlaying;
    }

    changeTrack(trackId) {
        this.currentTrackId = trackId;
        localStorage.setItem("currentTrackId", trackId.toString());
        const wasPlaying = this.isPlaying;
        this.initializeAudio();
        if (wasPlaying) {
            this.play();
        }
    }

    getCurrentTrack() {
        return this.tracks.find((t) => t.id === this.currentTrackId);
    }
}
