import { Quiz } from '@common/quiz';
import { Player } from '@common/player';

export interface Game {
    id: string;
    players: Player[];
    quiz?: Quiz;
    locked: boolean;
}
