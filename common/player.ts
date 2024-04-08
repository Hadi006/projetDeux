import { Question } from '@common/quiz';

interface Player {
    id: string;
    name: string;
    score: number;
    questions: Question[];
    fastestResponseCount: number;
    muted: boolean;
    hasInteracted: boolean;
    hasConfirmedAnswer: boolean;
    hasLeft: boolean;
    isActive: boolean;
}

class Player implements Player {
    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.score = 0;
        this.questions = [];
        this.fastestResponseCount = 0;
        this.muted = false;
        this.hasInteracted = false;
        this.hasConfirmedAnswer = false;
        this.hasLeft = false;
        this.isActive = false;
    }
}

export { Player };
