import { Question, Quiz } from '@common/quiz';
import { randomUUID } from 'crypto';
import { QuestionValidator } from './question-validator';

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

    checkDescription(): QuizValidator {
        this.tasks.push(async () => {
            if (!this.isObject) {
                return;
            }

            const QUIZ = this.quiz as object;
            if (!('description' in QUIZ) || typeof QUIZ.description !== 'string') {
                this.compilationError += 'Quiz : description is missing !\n';
                return;
            }
            this.newQuiz.description = QUIZ.description as string;
        });

        return this;
    }

    checkDuration(): QuizValidator {
        this.tasks.push(async () => {
            if (!this.isObject) {
                return;
            }

            const QUIZ = this.quiz as object;
            if (!('duration' in QUIZ) || typeof QUIZ.duration !== 'number') {
                this.compilationError += 'Quiz : duration is missing !\n';
                return;
            }

            const DURATION = QUIZ.duration as number;
            const MIN_DURATION = 10;
            const MAX_DURATION = 60;
            const VALID_DURATION = DURATION >= MIN_DURATION && DURATION <= MAX_DURATION;
            if (!VALID_DURATION) {
                this.compilationError += 'Quiz : duration must be between 10 and 60 !\n';
                return;
            }
            this.newQuiz.duration = DURATION;
        });

        return this;
    }

    checkQuestions(): QuizValidator {
        this.tasks.push(async () => {
            if (!this.isObject) {
                return;
            }

            const QUIZ = this.quiz as object;
            if (!('questions' in QUIZ) || !Array.isArray(QUIZ.questions)) {
                this.compilationError += 'Quiz : questions are missing !\n';
                return;
            }

            if ((QUIZ.questions as unknown[]).length < 1) {
                this.compilationError += 'Quiz : at least one question is required !\n';
                return;
            }

            for (const QUESTION of QUIZ.questions) {
                const RESULT: { question: Question; compilationError: string } = new QuestionValidator(QUESTION)
                    .checkId()
                    .checkText()
                    .checkType()
                    .checkPoints()
                    .checkChoices()
                    .compile();
                if (RESULT.compilationError) {
                    this.compilationError += RESULT.compilationError;
                } else {
                    this.newQuiz.questions.push(RESULT.question);
                }
            }
        });

        return this;
    }

    async compile(): Promise<{ quiz: Quiz; compilationError: string }> {
        for (const TASK of this.tasks) {
            await TASK();
        }
        this.newQuiz.lastModification = new Date();
        this.newQuiz.visible = false;

        return { quiz: this.newQuiz, compilationError: this.compilationError };
    }

    private checkType(): QuizValidator {
        this.tasks.push(async () => {
            if (!this.quiz || typeof this.quiz !== 'object') {
                this.compilationError += 'Quiz : must be an object of type Quiz !\n';
                this.isObject = false;
                return;
            }
            this.isObject = true;
        });

        return this;
    }
}
