import React from "react";
import { useGame } from "../../contexts/GameContext";
import { Portal } from "./Portal";

export function GameUI() {
    const { gameState } = useGame();

    // gameState나 character가 없는 경우에도 포탈은 표시
    return (
        <div className="fixed inset-0 pointer-events-none">
            {gameState?.character && (
                <>
                    {/* 스탯 표시 */}
                    <div className="absolute top-4 left-4 pointer-events-auto">
                        <div className="bg-black bg-opacity-50 p-4 rounded-lg text-white">
                            <h2 className="text-xl mb-2">Stats</h2>
                            <div className="space-y-2">
                                <div>
                                    Strategy:{" "}
                                    {gameState.character.stats.strategy}
                                </div>
                                <div>
                                    Analysis:{" "}
                                    {gameState.character.stats.analysis}
                                </div>
                                <div>
                                    Insight: {gameState.character.stats.insight}
                                </div>
                                <div>
                                    Mental Focus:{" "}
                                    {gameState.character.stats.mentalFocus}
                                </div>
                                <div>
                                    Stamina: {gameState.character.stats.stamina}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 리소스 표시 */}
                    <div className="absolute top-4 right-4 pointer-events-auto">
                        <div className="bg-black bg-opacity-50 p-4 rounded-lg text-white">
                            <h2 className="text-xl mb-2">Resources</h2>
                            <div className="space-y-2">
                                <div>
                                    Bankroll: $
                                    {gameState.character.resources.bankroll}
                                </div>
                                <div>
                                    Energy:{" "}
                                    {gameState.character.resources.energy}
                                </div>
                                <div>
                                    Reputation:{" "}
                                    {gameState.character.resources.reputation}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* 포탈 - 항상 표시 */}
            <div
                className="absolute top-4 right-4 pointer-events-auto"
                style={{ zIndex: 9999 }}
            >
                <Portal />
            </div>
        </div>
    );
}
