export class LanguageSelector {
    constructor(ui) {
        this.ui = ui;
        this.element = this.create();
    }

    create() {
        const container = document.createElement("div");
        container.style.cssText = this.ui.styles.languageSelector;

        const select = this.createSelect();
        container.appendChild(select);
        document.body.appendChild(container);

        return container;
    }

    createSelect() {
        const select = document.createElement("select");
        select.style.cssText = this.ui.styles.languageSelect;

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
