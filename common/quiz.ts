import { QuestionType } from "./constant";

interface Answer {
    text: string;
    isCorrect?: boolean;
}

interface Question {
    text: string;
    type: QuestionType | '' | 'QCM' | 'QRL';
    points: number;
    lastModification?: Date;
    choices: Answer[];
    qrlAnswer: string;
}

interface Quiz {
    id: string;
    title: string;
    visible: boolean;
    description: string;
    duration: number;
    lastModification: Date;
    questions: Question[];
}

class Answer implements Answer {
    constructor(text: string = '', isCorrect: boolean = false) {
        this.text = text;
        this.isCorrect = isCorrect;
    }
}

class Question implements Question {
    constructor() {
        this.text = '';
        this.type = '';
        this.points = 0;
        this.choices = [new Answer(), new Answer()];
        this.qrlAnswer = '';
    }
}

class Quiz implements Quiz {
    constructor() {
        this.id = '';
        this.title = '';
        this.visible = false;
        this.description = '';
        this.duration = 0;
        this.questions = [];
    }
}

export { Answer, Question, Quiz };
