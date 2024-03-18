import { HistogramData } from '@common/histogram-data';
import { Player } from '@common/player';
import { Quiz } from '@common/quiz';

export interface Game {
    pin: string;
    hostId: string;
    players: Player[];
    quiz?: Quiz;
    locked: boolean;
    bannedNames: string[];
    histograms: HistogramData[];
}
