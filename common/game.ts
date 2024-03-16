import { Quiz } from '@common/quiz';
import { Player } from '@common/player';

export interface Game {
    pin: string;
    players: Player[];
    quiz?: Quiz;
    locked: boolean;
    bannedNames: string[];
}
