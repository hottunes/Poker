import { styles } from "../styles/styles";

export class LanguageSelector {
    constructor(language) {
        this.language = language;
        this.container = this.createContainer();
    }

    createContainer() {
        const container = document.createElement("div");
        container.style.cssText = styles.languageContainer;

        const select = this.createSelect();
        container.appendChild(select);
        document.body.appendChild(container);
        return container;
    }

    createSelect() {
        const select = document.createElement("select");
        select.style.cssText = styles.languageSelect;

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
            option.selected = this.language.getCurrentLang() === code;
            select.appendChild(option);
        });

        select.onchange = (e) => this.language.setLanguage(e.target.value);
        return select;
    }
}
