import React, { useEffect, useState } from "react";
import { useGame } from "../../contexts/GameContext";

export function Portal() {
    const { gameState } = useGame();
    const [isEntrance, setIsEntrance] = useState(false);
    const [referringGame, setReferringGame] = useState(null);

    useEffect(() => {
        // URL 파라미터 체크
        const params = new URLSearchParams(window.location.search);
        const isFromPortal = params.get("portal") === "true";
        const refGame = params.get("ref");

        if (isFromPortal && refGame) {
            setIsEntrance(true);
            setReferringGame(refGame);
        }
    }, []);

    const handlePortalClick = () => {
        // 현재 게임 상태를 URL 파라미터로 변환
        const params = new URLSearchParams();

        // 기본 파라미터
        params.append("portal", "true");
        params.append("username", gameState?.character?.name || "player");
        params.append("color", "white");
        params.append("speed", "1");

        // 현재 게임의 URL을 ref로 추가
        params.append("ref", window.location.href);

        // 포털을 통해 들어온 경우, 이전 게임으로 돌아가기
        if (isEntrance && referringGame) {
            window.location.href = referringGame;
            return;
        }

        // 다음 게임으로 이동
        const nextPage = `http://portal.pieter.com/?${params.toString()}`;
        window.location.href = nextPage;
    };

    return (
        <button onClick={handlePortalClick} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
            <div className="relative bg-black px-7 py-4 rounded-lg leading-none flex items-center">
                <div className="flex flex-col items-center space-y-2">
                    <span className="text-purple-400 group-hover:text-gray-100 transition duration-200 text-lg font-medium">
                        {isEntrance
                            ? "이전 게임으로 돌아가기"
                            : "VIBEVERSE PORTAL"}
                    </span>
                    <span className="text-gray-400 group-hover:text-purple-300 transition duration-200 text-sm">
                        {isEntrance
                            ? "← 클릭하여 돌아가기"
                            : "다음 게임으로 이동 →"}
                    </span>
                </div>
            </div>
        </button>
    );
}
