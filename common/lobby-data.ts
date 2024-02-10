import { GameData } from './game-data';
import { PlayerData } from './player-data';

export interface LobbyData {
    id: number;
    players: PlayerData[];
    game?: GameData;
    started: boolean;
}
