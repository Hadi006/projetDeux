import { Quiz } from '@common/quiz';
import { Player } from '@common/player';

export interface LobbyData {
    id: string;
    players: Player[];
    quiz?: Quiz;
    locked: boolean;
}
