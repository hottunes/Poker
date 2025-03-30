export class CharacterProfile {
    constructor(character, language) {
        this.character = character;
        this.language = language;
        this.container = this.createContainer();
        document.addEventListener("languageChanged", this.updateText.bind(this));
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
        const profileImage = document.createElement("div");
        profileImage.style.cssText = `
            width: 50px;
            height: 50px;
            background: url('assets/images/profile.png') center/cover;
            border-radius: 50%;
            border: 2px solid rgb(76, 175, 80);
            box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
        `;

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
        this.nameElement.textContent = this.character.name;

        // 플레이어 스타일
        this.styleElement = document.createElement("div");
        this.styleElement.style.cssText = `
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
        `;
        this.styleElement.textContent = this.language.t(
            `character.style.${this.character.style}`
        );

        // 정보 요소들을 컨테이너에 추가
        infoContainer.appendChild(this.nameElement);
        infoContainer.appendChild(this.styleElement);

        // 모든 요소를 메인 컨테이너에 추가
        container.appendChild(profileImage);
        container.appendChild(infoContainer);

        return container;
    }

    update() {
        // DOM 요소 참조를 사용하여 직접 업데이트
        this.nameElement.textContent = this.character.name;
        this.styleElement.textContent = this.language.t(
            `character.style.${this.character.style}`
        );
    }

    const updateText = () => {
        title.textContent = this.language.t("advertisement.title");
        description.textContent = this.language.t("advertisement.description");
    };
}
