export class CharacterProfile {
    constructor(character, language) {
        this.character = character;
        this.language = language;
        this.container = this.createContainer();
        this.update(); // 초기 업데이트 수행
    }

    createContainer() {
        const container = document.createElement("div");
        container.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-family: 'system-ui', sans-serif;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 15px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;

        // 프로필 이미지
        this.profileImage = document.createElement("div");
        this.updateProfileImage(); // 프로필 이미지 초기화

        // 플레이어 정보 컨테이너
        const infoContainer = document.createElement("div");
        infoContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 5px;
        `;

        // 플레이어 이름
        this.nameElement = document.createElement("div");
        this.nameElement.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            color: rgb(76, 175, 80);
        `;

        // 플레이어 스타일
        this.styleElement = document.createElement("div");
        this.styleElement.style.cssText = `
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
        `;

        // 정보 요소들을 컨테이너에 추가
        infoContainer.appendChild(this.nameElement);
        infoContainer.appendChild(this.styleElement);

        // 모든 요소를 메인 컨테이너에 추가
        container.appendChild(this.profileImage);
        container.appendChild(infoContainer);

        return container;
    }

    updateProfileImage() {
        this.profileImage.style.cssText = `
            width: 50px;
            height: 50px;
            background: url('images/player/player_0${
                this.character.profileImage || 1
            }.png') center/cover;
            border-radius: 50%;
            border: 2px solid rgb(76, 175, 80);
            box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
        `;
    }

    update() {
        // 프로필 이미지 업데이트
        this.updateProfileImage();

        // 이름과 스타일 업데이트
        this.nameElement.textContent =
            this.character.nickname || this.character.name;
        this.styleElement.textContent = this.language.t(
            `character.style.${this.character.style}`
        );
    }

    onResize(width, height) {
        // 화면 크기에 따라 위치 조정
        this.container.style.left = "50%";
        this.container.style.transform = "translateX(-50%)";
    }
}
