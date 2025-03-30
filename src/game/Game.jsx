import React, { useEffect, useRef } from "react";
import { useGame } from "../contexts/GameContext";
import { GameUI } from "./ui/GameUI";
import { TournamentResult } from "./ui/TournamentResult";
import { Portal } from "./ui/Portal";

export function Game() {
    const { gameState, updateGameState } = useGame();
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        const animate = () => {
            // 게임 로직 업데이트
            if (gameState.currentScreen === "game") {
                // 게임 상태 업데이트
                updateGameState((prev) => ({
                    ...prev,
                    // 게임 상태 업데이트 로직
                }));
            }

            // 화면 렌더링
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 게임 화면 렌더링
            if (gameState.currentScreen === "game") {
                // 게임 화면 렌더링 로직
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [gameState, updateGameState]);

    return (
        <div className="relative w-full h-full">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ zIndex: 1 }}
            />
            <div className="relative z-10">
                <GameUI />
                {gameState.tournamentResult && (
                    <TournamentResult
                        result={gameState.tournamentResult}
                        onClose={() =>
                            updateGameState((prev) => ({
                                ...prev,
                                tournamentResult: null,
                            }))
                        }
                    />
                )}
            </div>
        </div>
    );
}
