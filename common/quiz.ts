interface Answer {
    text: string;
    isCorrect: boolean;
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

export { Answer, Question, Quiz };
