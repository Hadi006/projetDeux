import { Quiz } from './quiz';
import { PlayerData } from './player-data';

export interface LobbyData {
    id: number;
    players: PlayerData[];
    quiz?: Quiz;
    started: boolean;
}
