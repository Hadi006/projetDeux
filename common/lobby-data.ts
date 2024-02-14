import { Quiz } from '@common/quiz';
import { Player } from '@common/player';

export interface LobbyData {
    id: number;
    players: Player[];
    quiz?: Quiz;
    started: boolean;
}
