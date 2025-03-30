export const styles = {
    tournamentCard: `
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
    `,
    tournamentHeader: `
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 10px;
        color: rgb(76, 175, 80);
    `,
    enterButton: (isPending) => `
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
    `,
    modal: (width) => `
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
    `,
    modalTitle: `
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 30px;
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    `,
    modalButton: `
        padding: 10px 20px;
        background: rgb(76, 175, 80);
        border: none;
        border-radius: 4px;
        color: white;
        cursor: pointer;
        font-size: 16px;
        margin-top: 20px;
        width: 100%;
    `,
    gradientButton: `
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
    `,
    resultInfo: `
        font-size: 24px;
        margin: 20px 0;
        color: #fff;
    `,
    header: `
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 15px;
        color: rgb(76, 175, 80);
        display: flex;
        justify-content: space-between;
        align-items: center;
    `,
    resetButton: `
        padding: 5px 10px;
        background: rgba(255, 0, 0, 0.7);
        border: none;
        border-radius: 4px;
        color: white;
        cursor: pointer;
        font-size: 12px;
        font-family: 'system-ui', sans-serif;
    `,
    languageSelect: `
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 5px 10px;
        font-size: 14px;
        cursor: pointer;
        outline: none;
        font-family: 'system-ui', sans-serif;
    `,
    languageContainer: `
        position: fixed;
        top: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.8);
        padding: 10px;
        border-radius: 6px;
        z-index: 1000;
        display: flex;
        align-items: center;
    `,
    mainContainer: `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px;
        border-radius: 10px;
        font-family: 'system-ui', sans-serif;
        z-index: 1000;
        width: 300px;
    `,
};
