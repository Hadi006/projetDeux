interface Answer {
    text: string;
    isCorrect: boolean;
}

interface Question {
    id: string;
    text: string;
    type: string;
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

export { Answer, Question, Quiz };

