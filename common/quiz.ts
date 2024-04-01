interface Answer {
    text: string;
    isCorrect?: boolean;
}

interface Question {
    text: string;
    type: 'QCM' | 'QRL' | '';
    points: number;
    lastModification?: Date;
    choices: Answer[];
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
    }
}

class Quiz implements Quiz {
    constructor() {
        this.id = '';
        this.title = '';
        this.visible = false;
        this.description = '';
        this.duration = 0;
        this.questions = [new Question()];
    }
}

export { Answer, Question, Quiz };
