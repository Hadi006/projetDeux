import { Player } from '@common/player';

export interface JoinGameEventData {
    player: Player;
    players: string[];
    gameTitle: string;
    error: string;
}
