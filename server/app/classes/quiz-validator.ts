import { Quiz } from '@common/quiz';

export class QuizValidator {
    private tasks: (() => Promise<void>)[];
    private quiz: unknown;
    private newQuiz: Quiz;
    private compilationError: string;
    private isObject: boolean;
    private getData: (query: object) => Promise<Quiz[]>;

    constructor(quiz: unknown, getData: (query: object) => Promise<Quiz[]>) {
        this.tasks = [];
        this.quiz = quiz;
        this.getData = getData;
        this.isObject = false;
        this.compilationError = '';
        this.newQuiz = {
            id: '',
            title: '',
            description: '',
            duration: 0,
            lastModification: new Date(),
            visible: false,
            questions: [],
        };
        this.checkType();
    }
}
