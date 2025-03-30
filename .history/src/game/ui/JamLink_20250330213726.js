export class JamLink {
    constructor() {
        this.createLink();
    }

    createLink() {
        const link = document.createElement("a");
        link.href = "https://jam.pieter.com";
        link.target = "_blank";
        link.textContent = "🕹️ Vibe Jam 2025";

        link.style.cssText = `
            font-family: 'system-ui', sans-serif;
            position: fixed;
            bottom: -1px;
            right: -1px;
            padding: 7px;
            font-size: 14px;
            font-weight: bold;
            background: #fff;
            color: #000;
            text-decoration: none;
            border-top-left-radius: 12px;
            z-index: 10000;
            border: 1px solid #fff;
            transition: all 0.3s ease;
        `;

        // 호버 효과
        link.onmouseover = () => {
            link.style.background = "#f0f0f0";
            link.style.transform = "translateY(-2px)";
            link.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
        };

        link.onmouseout = () => {
            link.style.background = "#fff";
            link.style.transform = "translateY(0)";
            link.style.boxShadow = "none";
        };

        document.body.appendChild(link);
    }
}
