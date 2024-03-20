import { HistogramData } from '@common/histogram-data';
import { Player } from '@common/player';
import { Quiz } from '@common/quiz';

interface Game {
    pin: string;
    hostId: string;
    players: Player[];
    quiz: Quiz;
    locked: boolean;
    bannedNames: string[];
    histograms: HistogramData[];
}

class Game implements Game {
    constructor(pin: string, hostId: string, quiz: Quiz) {
        this.pin = pin;
        this.hostId = hostId;
        this.quiz = quiz;
        this.players = [];
        this.locked = false;
        this.bannedNames = [];
        this.histograms = [];
    }
}

export { Game };
