import { ContainerStyles } from "./ContainerStyles";
import { CardStyles } from "./CardStyles";
import { ModalStyles } from "./ModalStyles";
import { ButtonStyles } from "./ButtonStyles";

export class UIStyles {
    constructor() {
        this.container = new ContainerStyles();
        this.card = new CardStyles();
        this.modal = new ModalStyles();
        this.button = new ButtonStyles();
    }

    get mainContainer() {
        return this.container.mainContainer;
    }

    get header() {
        return this.container.header;
    }

    get tournamentCard() {
        return this.card.tournamentCard;
    }

    get tournamentHeader() {
        return this.card.tournamentHeader;
    }

    enterButton(isPending) {
        return this.card.enterButton(isPending);
    }

    modal(width) {
        return this.modal.modal(width);
    }

    get modalTitle() {
        return this.modal.modalTitle;
    }

    get modalButton() {
        return this.modal.modalButton;
    }

    get gradientButton() {
        return this.modal.gradientButton;
    }

    get resultInfo() {
        return this.modal.resultInfo;
    }

    get resetButton() {
        return this.button.resetButton;
    }
}
