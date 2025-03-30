export class LanguageSelector {
    constructor(ui) {
        this.ui = ui;
        this.element = this.create();
    }

    create() {
        const container = document.createElement("div");
        container.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px;
            border-radius: 6px;
            z-index: 1000;
            display: flex;
            align-items: center;
        `;

        const select = this.createSelect();
        container.appendChild(select);
        document.body.appendChild(container);
        return container;
    }

    createSelect() {
        const select = document.createElement("select");
        select.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 5px 10px;
            font-size: 14px;
            cursor: pointer;
            outline: none;
            font-family: 'system-ui', sans-serif;
        `;

        const languages = {
            en: "English",
            zh: "中文",
            ja: "日本語",
            ko: "한국어",
        };

        Object.entries(languages).forEach(([code, name]) => {
            const option = document.createElement("option");
            option.value = code;
            option.textContent = name;
            option.selected = this.ui.language.getCurrentLang() === code;
            select.appendChild(option);
        });

        select.onchange = (e) => this.ui.language.setLanguage(e.target.value);
        return select;
    }
}
