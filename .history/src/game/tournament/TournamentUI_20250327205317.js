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
        button.onclick = () => this.enterTournament(tournament);
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

    enterTournament(tournament) {
        const result = tournament.enter(this.game.character, "normal");
        if (result.success) {
            this.showResult(result.result);
            this.game.characterUI.updateUI();
        } else {
            alert(result.message);
        }
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
            min-width: 300px;
        `;

        const title = document.createElement("div");
        title.style.cssText = `
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: ${result.prize > 0 ? "#4CAF50" : "#666"};
        `;

        // 순위 표시 개선
        const totalPlayers =
            result.totalPlayers ||
            Math.floor(result.rank / (result.percentile / 100));
        const itmCount = Math.floor(totalPlayers * 0.15);
        const isITM = result.rank <= itmCount;

        if (result.rank === 1) {
            title.textContent = "🏆 우승!";
        } else if (isITM) {
            title.textContent = `${result.rank}등 달성! (ITM)`;
        } else {
            title.textContent = `${result.rank}등`;
        }
        modal.appendChild(title);

        const details = document.createElement("div");
        details.style.marginBottom = "20px";

        // 상세 정보 표시
        let resultDetails = "";

        // 상금 정보 표시 개선
        if (result.prize > 0) {
            resultDetails += `
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 14px; color: #888; margin-bottom: 5px;">획득 상금</div>
                    <div style="color: #4CAF50; font-size: 24px; font-weight: bold;">
                        ${result.prize.toLocaleString()}
                    </div>
                </div>
            `;
        } else {
            resultDetails += `
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 14px; color: #888; margin-bottom: 5px;">획득 상금</div>
                    <div style="color: #666; font-size: 18px;">
                        상금권 미달성
                    </div>
                </div>
            `;
        }

        // 토너먼트 정보
        resultDetails += `
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <div style="margin-bottom: 8px;">
                    <span style="color: #888;">총 참가자:</span>
                    <span style="float: right;">${totalPlayers}명</span>
                </div>
                <div style="margin-bottom: 8px;">
                    <span style="color: #888;">등수:</span>
                    <span style="float: right;">${result.rank}등</span>
                </div>
                <div style="margin-bottom: 8px;">
                    <span style="color: #888;">상위:</span>
                    <span style="float: right;">${Math.round(
                        result.percentile
                    )}%</span>
                </div>
                <div>
                    <span style="color: #888;">획득 점수:</span>
                    <span style="float: right;">${Math.round(
                        result.score
                    )}점</span>
                </div>
            </div>
        `;

        details.innerHTML = resultDetails;
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
            width: 100%;
            font-size: 16px;
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
