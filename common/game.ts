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
    name: string;
    date: Date;
    nPlayers: number;
    bestScore: number;
    ended: boolean;
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
        this.name = quiz.title;
        this.date = new Date();
        this.nPlayers = 0;
        this.bestScore = 0;
        this.ended = false;
    }
}

export { Game };
