import { Tournament } from "./Tournament";

export class TournamentUI {
    constructor(game) {
        this.game = game;
        this.container = this.createContainer();
        this.tournaments = [];
        this.updateUI();
    }

    createContainer() {
        const container = document.createElement("div");
        container.style.cssText = `
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
        `;
        document.body.appendChild(container);
        return container;
    }

    createTournamentCard(tournament) {
        const card = document.createElement("div");
        card.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
        `;

        const info = tournament.getInfo();

        // 토너먼트 이름과 타입
        const header = document.createElement("div");
        header.style.cssText = `
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #4CAF50;
        `;
        header.textContent = `${info.name} (${this.formatType(info.type)})`;
        card.appendChild(header);

        // 토너먼트 정보
        const details = document.createElement("div");
        details.style.fontSize = "14px";
        details.innerHTML = `
            참가비: ${info.buyIn} | 상금: ${info.prizePool}<br>
            참가자: ${info.currentPlayers}/${info.maxPlayers}
        `;
        card.appendChild(details);

        // 참가 버튼
        const button = document.createElement("button");
        button.style.cssText = `
            width: 100%;
            padding: 8px;
            margin-top: 10px;
            background: #4CAF50;
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-family: 'system-ui', sans-serif;
        `;
        button.textContent = "참가하기";
        button.onclick = () => this.showStrategySelection(tournament);
        card.appendChild(button);

        return card;
    }

    formatType(type) {
        const types = {
            local: "로컬",
            online: "온라인",
            major: "메이저",
        };
        return types[type] || type;
    }

    showStrategySelection(tournament) {
        const modal = document.createElement("div");
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 10px;
            z-index: 2000;
            text-align: center;
        `;

        const title = document.createElement("div");
        title.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #4CAF50;
        `;
        title.textContent = "전략 선택";
        modal.appendChild(title);

        const strategies = [
            {
                id: "moneyIn",
                name: "머니인 목표",
                description: "안정적인 상금권 진입",
            },
            {
                id: "aggressive",
                name: "공격적 우승",
                description: "1위를 노리는 공격적 플레이",
            },
        ];

        strategies.forEach((strategy) => {
            const button = document.createElement("button");
            button.style.cssText = `
                display: block;
                width: 100%;
                padding: 10px;
                margin: 10px 0;
                background: #4CAF50;
                border: none;
                border-radius: 4px;
                color: white;
                cursor: pointer;
                font-family: 'system-ui', sans-serif;
            `;
            button.innerHTML = `
                <div style="font-weight: bold">${strategy.name}</div>
                <div style="font-size: 12px">${strategy.description}</div>
            `;
            button.onclick = () => {
                const result = tournament.enter(
                    this.game.character,
                    strategy.id
                );
                if (result.success) {
                    this.showResult(result.result);
                    this.game.characterUI.updateUI();
                } else {
                    alert(result.message);
                }
                document.body.removeChild(modal);
            };
            modal.appendChild(button);
        });

        document.body.appendChild(modal);
    }

    showResult(result) {
        const modal = document.createElement("div");
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 10px;
            z-index: 2000;
            text-align: center;
            color: white;
        `;

        const title = document.createElement("div");
        title.style.cssText = `
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #4CAF50;
        `;
        title.textContent = `${result.rank}등 달성!`;
        modal.appendChild(title);

        const details = document.createElement("div");
        details.style.marginBottom = "20px";
        details.innerHTML = `
            상금: ${result.prize}<br>
            점수: ${Math.round(result.score)}
        `;
        modal.appendChild(details);

        const button = document.createElement("button");
        button.style.cssText = `
            padding: 10px 20px;
            background: #4CAF50;
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-family: 'system-ui', sans-serif;
        `;
        button.textContent = "확인";
        button.onclick = () => {
            document.body.removeChild(modal);
        };
        modal.appendChild(button);

        document.body.appendChild(modal);
    }

    updateUI() {
        this.container.innerHTML = "";

        const header = document.createElement("div");
        header.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #4CAF50;
        `;
        header.textContent = "진행 중인 토너먼트";
        this.container.appendChild(header);

        // 샘플 토너먼트 생성
        const tournaments = [
            new Tournament("로컬 프리롤", 100, 1000, 20, "local"),
            new Tournament("온라인 스페셜", 500, 5000, 50, "online"),
            new Tournament("메이저 챔피언십", 2000, 20000, 100, "major"),
        ];

        tournaments.forEach((tournament) => {
            this.container.appendChild(this.createTournamentCard(tournament));
        });
    }
}
