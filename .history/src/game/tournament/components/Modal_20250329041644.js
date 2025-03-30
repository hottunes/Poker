import { styles } from "../styles/styles";
import { addModalAnimations } from "../utils/animations";

export class Modal {
    constructor(width = "400px") {
        this.width = width;
        this.modal = this.createModal();
        addModalAnimations();
    }

    createModal() {
        const modal = document.createElement("div");
        modal.style.cssText = styles.modal(this.width);
        document.body.appendChild(modal);
        return modal;
    }

    createTitle(text, color = "#FFD700") {
        const title = document.createElement("div");
        title.style.cssText = styles.modalTitle;
        title.style.color = color;
        title.textContent = text;
        return title;
    }

    createButton(text, onClick, gradient = false) {
        const button = document.createElement("button");
        button.style.cssText = gradient
            ? styles.gradientButton
            : styles.modalButton;
        button.textContent = text;
        button.onclick = onClick;
        return button;
    }

    close() {
        document.body.removeChild(this.modal);
    }

    setContent(content) {
        this.modal.innerHTML = "";
        this.modal.appendChild(content);
    }
}
