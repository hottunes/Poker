export class CardStyles {
    tournamentCard = `
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
    `;

    tournamentHeader = `
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 10px;
        color: rgb(76, 175, 80);
    `;

    enterButton(isPending) {
        return `
            width: 100%;
            padding: 8px;
            margin-top: 10px;
            background: ${isPending ? "#666" : "rgb(76, 175, 80)"};
            border: none;
            border-radius: 4px;
            color: white;
            cursor: ${isPending ? "not-allowed" : "pointer"};
            font-family: 'system-ui', sans-serif;
            opacity: ${isPending ? "0.7" : "1"};
        `;
    }
}
