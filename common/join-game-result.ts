import { Game } from './game';
import { Player } from './player';

interface JoinGameResult {
    player: Player,
    gameTitle: string,
    otherPlayers: string[],
    error: string,
}

class JoinGameResult implements JoinGameResult {
    constructor(error: string, player: Player, game?: Game) {
        this.player = player;
        this.gameTitle = game?.quiz.title || '';
        this.otherPlayers = game?.players.map((player) => player.name) || [];
        this.error = error;
    }
}

export { JoinGameResult };

