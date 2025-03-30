import React from "react";
import { GameProvider } from "./contexts/GameContext";
import { Game } from "./game/Game";

function App() {
    return (
        <GameProvider>
            <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
                <Game />
            </div>
        </GameProvider>
    );
}

export default App;
