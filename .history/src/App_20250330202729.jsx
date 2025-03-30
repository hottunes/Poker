import React from "react";
import { GameProvider } from "./contexts/GameContext";
import { Game } from "./game/Game";
import { Portal } from "./game/ui/Portal";

function App() {
    return (
        <GameProvider>
            <div className="relative w-full h-screen bg-gray-900">
                <Game />
                <Portal type="exit" position="top-right" />
            </div>
        </GameProvider>
    );
}

export default App;
