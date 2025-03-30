import React from "react";
import { GameProvider } from "./contexts/GameContext";
import { Game } from "./game/Game";
import { Portal } from "./game/ui/Portal";

function App() {
    return (
        <GameProvider>
            <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
                <Game />
                <div className="fixed inset-0 z-[9999]">
                    <Portal type="exit" position="top-right" />
                </div>
            </div>
        </GameProvider>
    );
}

export default App;
