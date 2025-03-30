/**
 * @class TournamentUI
 * @description 토너먼트 UI를 관리하는 클래스
 * 주요 기능:
 * 1. 토너먼트 목록 표시
 * 2. 언어 선택
 * 3. 토너먼트 참가 및 결과 표시
 * 4. 파이널 테이블 진출 및 결과 표시
 */
import { Tournament } from "./Tournament";
import { Language } from "../i18n/Language";

export class TournamentUI {
    /**
     * @constructor
     * @param {Game} game - 게임 인스턴스
     */
    constructor(game) {
        // 기본 속성 초기화
        this.initializeProperties(game);
        // UI 초기화 및 이벤트 설정
        this.initializeUI();
        // 언어 변경 감지
        this.language.addObserver(() => this.updateUI());
    }

    /**
     * @method initializeProperties
     * @description 클래스의 기본 속성들을 초기화
     */
    initializeProperties(game) {
        this.game = game;
        this.language = game.language;
        this.tournaments = this.createTournaments();
        this.isPendingFinalTable = false;
        this.game.character.tournament = this.tournaments[0];
    }

    /**
     * @method createTournaments
     * @description 토너먼트 인스턴스들을 생성
     */
    createTournaments() {
        return [
            new Tournament("online", 100, 1000), // 일반 토너먼트: 바이인 100, 1000명
            new Tournament("highroller", 1000, 200), // 하이롤러: 바이인 1000, 200명
        ];
    }

    /**
     * @method initializeUI
     * @description UI 컴포넌트 초기화 및 렌더링
     */
    initializeUI() {
        this.container = this.createMainContainer();
        this.languageSelector = this.createLanguageSelector();
        this.updateUI();
    }

    // =========================================
    // 컨테이너 컴포넌트
    // =========================================

    /**
     * @method createMainContainer
     * @description 메인 토너먼트 컨테이너 생성
     */
    createMainContainer() {
        const container = document.createElement("div");
        container.style.cssText = this.styles.mainContainer;
        document.body.appendChild(container);
        return container;
    }

    /**
     * @method createLanguageSelector
     * @description 언어 선택 컴포넌트 생성
     */
    createLanguageSelector() {
        const container = document.createElement("div");
        container.style.cssText = this.styles.languageContainer;
        container.appendChild(this.createLanguageSelect());
        document.body.appendChild(container);
        return container;
    }

    // =========================================
    // 토너먼트 카드 컴포넌트
    // =========================================

    /**
     * @method createTournamentCard
     * @description 토너먼트 카드 컴포넌트 생성
     */
    createTournamentCard(tournament) {
        const card = document.createElement("div");
        card.style.cssText = this.styles.tournamentCard;
        const info = tournament.getInfo();

        return this.appendChildren(card, [
            this.createTournamentHeader(tournament),
            this.createTournamentDetails(info),
            this.createEnterButton(tournament),
        ]);
    }

    // =========================================
    // 모달 컴포넌트
    // =========================================

    /**
     * @method createModal
     * @description 모달 컴포넌트 생성
     */
    createModal(content, width = "400px") {
        const modal = document.createElement("div");
        modal.style.cssText = this.styles.modal(width);
        return this.appendChildren(modal, [content]);
    }

    /**
     * @method showFinalTableQualification
     * @description 파이널 테이블 진출 모달 표시
     */
    showFinalTableQualification(tournament, initialResult) {
        const content = this.createFinalTableQualificationContent(
            tournament,
            initialResult
        );
        const modal = this.createModal(content);
        this.addModalAnimations();
        document.body.appendChild(modal);
    }

    /**
     * @method showFinalTableResult
     * @description 파이널 테이블 결과 모달 표시
     */
    showFinalTableResult(finalResult) {
        const content = this.createFinalTableResultContent(finalResult);
        const modal = this.createModal(content, "500px");
        document.body.appendChild(modal);
    }

    // =========================================
    // 유틸리티 메서드
    // =========================================

    /**
     * @method appendChildren
     * @description 여러 자식 엘리먼트를 부모에 추가
     */
    appendChildren(parent, children) {
        children.forEach((child) => parent.appendChild(child));
        return parent;
    }

    /**
     * @method handleEnterClick
     * @description 토너먼트 참가 버튼 클릭 처리
     */
    handleEnterClick(tournament) {
        if (this.isPendingFinalTable) return;

        const result = tournament.enter(this.game.character);
        if (!result.success) {
            alert(result.message);
            return;
        }

        if (result.finalTable) {
            this.handleFinalTableEntry(tournament, result);
        } else {
            this.showResult(result.result);
        }
    }

    /**
     * @method handleFinalTableEntry
     * @description 파이널 테이블 진출 처리
     */
    handleFinalTableEntry(tournament, result) {
        this.isPendingFinalTable = true;
        this.updateUI();
        this.showFinalTableQualification(tournament, result.result);
    }

    // =========================================
    // 스타일 정의
    // =========================================

    styles = {
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
    };

    /**
     * @method addModalAnimations
     * @description 모달 애니메이션 스타일 추가
     */
    addModalAnimations() {
        const style = document.createElement("style");
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translate(-50%, -60%); }
                to { opacity: 1; transform: translate(-50%, -50%); }
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
}
