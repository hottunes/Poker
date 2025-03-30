export class AudioManager {
    constructor() {
        this.tracks = [
            { id: 1, url: "audio/track1.mp3" },
            { id: 2, url: "audio/track2.mp3" },
            { id: 3, url: "audio/track3.mp3" },
        ];
        this.currentTrackId = 1;
        this.audio = new Audio(this.tracks[0].url);
        this.audio.loop = true;
        this.isPlaying = false;
        this.volume = 0.5;
        this.audio.volume = this.volume;

        // 오디오 로드 에러 처리
        this.audio.onerror = (e) => {
            console.warn("Audio load error:", e);
            this.isPlaying = false;
        };

        // 사용자 상호작용 이벤트 리스너
        const startAudioOnInteraction = () => {
            if (!this.isPlaying) {
                this.play().catch(console.warn);
            }
            // 이벤트 리스너 제거
            document.removeEventListener("click", startAudioOnInteraction);
            document.removeEventListener("touchstart", startAudioOnInteraction);
        };

        document.addEventListener("click", startAudioOnInteraction);
        document.addEventListener("touchstart", startAudioOnInteraction);
    }

    async play() {
        try {
            await this.audio.play();
            this.isPlaying = true;
        } catch (error) {
            console.warn("Playback failed:", error);
            this.isPlaying = false;
            throw error;
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
    }

    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play().catch(console.warn);
        }
        return this.isPlaying;
    }

    changeTrack(trackId) {
        const track = this.tracks.find((t) => t.id === trackId);
        if (track) {
            const wasPlaying = this.isPlaying;
            this.audio.src = track.url;
            this.currentTrackId = trackId;
            if (wasPlaying) {
                this.play().catch(console.warn);
            }
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.volume;
    }

    getVolume() {
        return this.volume;
    }
}
