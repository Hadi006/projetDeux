import { Quiz } from '@common/quiz';
import { randomUUID } from 'crypto';

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

    checkId(): QuizValidator {
        this.tasks.push(async () => {
            if (!this.isObject) {
                return;
            }

            const QUIZ = this.quiz as object;
            if (!('id' in QUIZ) || typeof QUIZ.id !== 'string' || QUIZ.id === '') {
                this.newQuiz.id = randomUUID();
                return;
            }

            this.newQuiz.id = QUIZ.id as string;
        });

        return this;
    }

    checkTitle(): QuizValidator {
        this.tasks.push(async () => {
            if (!this.isObject) {
                return;
            }

            const QUIZ = this.quiz as object;
            if (!('title' in QUIZ) || typeof QUIZ.title !== 'string' || QUIZ.title === '') {
                this.compilationError += 'Quiz : title is missing !\n';
                return;
            }

            const TITLE = QUIZ.title as string;
            const SAME_NAMES = await this.getData({ title: TITLE });
            if (SAME_NAMES.length > 0 && SAME_NAMES[0].id !== this.newQuiz.id) {
                this.compilationError += 'Quiz : title must be unique !\n';
                return;
            }

            this.newQuiz.title = TITLE;
        });

        return this;
    }
}
