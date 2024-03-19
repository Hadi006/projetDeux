import { Question } from '@common/quiz';

interface Player {
    name: string;
    score: number;
    questions: Question[];
    fastestResponseCount: number;
}

class Player implements Player {
    constructor(name: string) {
        this.name = name;
        this.score = 0;
        this.questions = [];
        this.fastestResponseCount = 0;
    }
}

export { Player };
