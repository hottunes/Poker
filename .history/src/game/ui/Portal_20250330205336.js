import React from "react";
import { useGame } from "../../contexts/GameContext";

export function Portal({ type = "exit", position = "top-right" }) {
    const { gameState } = useGame();
    const isPortalEnabled = true; // 항상 표시되도록 수정

    const handlePortalClick = () => {
        if (type === "exit") {
            // 현재 게임 상태를 URL 파라미터로 변환
            const currentParams = new URLSearchParams(window.location.search);
            const newParams = new URLSearchParams();

            // 기본 파라미터 추가
            newParams.append("portal", "true");
            newParams.append("username", gameState.character?.name || "player");
            newParams.append("color", "white");
            newParams.append("speed", "1");

            // 현재 URL의 모든 파라미터를 유지
            for (const [key, value] of currentParams) {
                if (!newParams.has(key)) {
                    newParams.append(key, value);
                }
            }

            // 다음 게임으로 이동
            const paramString = newParams.toString();
            const nextPage =
                "http://portal.pieter.com" +
                (paramString ? "?" + paramString : "");
            window.location.href = nextPage;
        }
    };

    // 포지션에 따른 스타일 설정
    const positionStyles = {
        "top-right": "top-4 right-4",
        "top-left": "top-4 left-4",
        "bottom-right": "bottom-4 right-4",
        "bottom-left": "bottom-4 left-4",
    };

    return (
        <button
            onClick={handlePortalClick}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer"
            style={{
                background: "linear-gradient(to right, #8B5CF6, #EC4899)",
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
            }}
        >
            <span className="text-lg font-bold whitespace-nowrap">
                VIBEVERSE PORTAL
            </span>
            <svg
                className="w-5 h-5 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
            </svg>
        </button>
    );
}
