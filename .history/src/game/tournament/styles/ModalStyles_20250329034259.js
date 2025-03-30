export class ModalStyles {
    modal(width) {
        return `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            padding: 30px;
            border-radius: 15px;
            z-index: 2000;
            text-align: center;
            color: white;
            min-width: ${width};
            max-height: 90vh;
            overflow-y: auto;
            animation: fadeIn 0.5s;
        `;
    }

    modalTitle = `
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 30px;
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    `;

    modalButton = `
        padding: 10px 20px;
        background: rgb(76, 175, 80);
        border: none;
        border-radius: 4px;
        color: white;
        cursor: pointer;
        font-size: 16px;
        margin-top: 20px;
        width: 100%;
    `;

    gradientButton = `
        padding: 15px 30px;
        background: linear-gradient(45deg, #FFD700, #FFA500);
        border: none;
        border-radius: 8px;
        color: white;
        cursor: pointer;
        font-family: 'system-ui', sans-serif;
        font-size: 18px;
        font-weight: bold;
        margin-top: 20px;
        transition: transform 0.2s;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
    `;

    resultInfo = `
        font-size: 24px;
        margin: 20px 0;
        color: #fff;
    `;
}
