import { SpreadGameImplementation } from "../spreadGame";
import { Ai } from "./ai";

class AiClient {
    ai: Ai;
    playerId: number;
    timeoutInterval: number;
    currentlyTimedOut: boolean;

    constructor(ai: Ai) {
        this.playerId = ai.playerId;
        this.ai = ai;
        this.timeoutInterval = 500;
        this.currentlyTimedOut = false;
    }

    getMove(gameState: SpreadGameImplementation) {
        if (!this.currentlyTimedOut) {
            const move = this.ai.getMove(gameState);
            if (move !== null) {
                this.currentlyTimedOut = true;
                setTimeout(
                    () => (this.currentlyTimedOut = false),
                    this.timeoutInterval
                );
                return move;
            }
        }
        return null;
    }
}

export default AiClient;
