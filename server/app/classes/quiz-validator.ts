import { MAX_DURATION, MIN_DURATION } from '@common/constant';
import { Question, Quiz } from '@common/quiz';
import { randomUUID } from 'crypto';
import { QuestionValidator } from './question-validator';

export class QuizValidator {
    private tasks: (() => Promise<void>)[];
    private quiz: Quiz;
    private newQuiz: Quiz;
    private compilationError: string;
    private isObject: boolean;
    private getData: (query: object) => Promise<Quiz[]>;

    constructor(quiz: unknown, getData: (query: object) => Promise<Quiz[]>) {
        this.tasks = [];
        this.quiz = quiz as Quiz;
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
            if (!('id' in this.quiz) || typeof this.quiz.id !== 'string' || this.quiz.id === '') {
                this.newQuiz.id = randomUUID();
                return;
            }

            this.newQuiz.id = this.quiz.id;
        });

        return this;
    }

    checkTitle(): QuizValidator {
        this.tasks.push(async () => {
            if (!this.isObject) {
                return;
            }

            if (!('title' in this.quiz) || typeof this.quiz.title !== 'string' || this.quiz.title === '') {
                this.compilationError += 'Quiz : titre manquant !\n';
                return;
            }

            const sameNameQuizzes = await this.getData({ title: this.quiz.title });
            if (sameNameQuizzes.length > 0 && sameNameQuizzes[0].id !== this.newQuiz.id) {
                this.compilationError += 'Quiz : titre déjà utilisé !\n';
                return;
            }

            this.newQuiz.title = this.quiz.title;
        });

        return this;
    }

    checkDescription(): QuizValidator {
        this.tasks.push(async () => {
            if (!this.isObject) {
                return;
            }

            if (!('description' in this.quiz) || typeof this.quiz.description !== 'string') {
                this.compilationError += 'Quiz : description manquante !\n';
                return;
            }
            this.newQuiz.description = this.quiz.description;
        });

        return this;
    }

    checkDuration(): QuizValidator {
        this.tasks.push(async () => {
            if (!this.isObject) {
                return;
            }

            if (!('duration' in this.quiz) || typeof this.quiz.duration !== 'number') {
                this.compilationError += 'Quiz : durée manquante !\n';
                return;
            }

            if (!(this.quiz.duration >= MIN_DURATION && this.quiz.duration <= MAX_DURATION)) {
                this.compilationError += 'Quiz : durée doit être entre 10 et 60 minutes !\n';
                return;
            }
            this.newQuiz.duration = this.quiz.duration;
        });

        return this;
    }

    checkQuestions(): QuizValidator {
        this.tasks.push(async () => {
            if (!this.isObject) {
                return;
            }

            if (!('questions' in this.quiz) || !Array.isArray(this.quiz.questions)) {
                this.compilationError += 'Quiz : questions manquantes !\n';
                return;
            }

            if ((this.quiz.questions as unknown[]).length < 1) {
                this.compilationError += 'Quiz : au moins une question est requise !\n';
                return;
            }

            for (const question of this.quiz.questions) {
                const result: { question: Question; compilationError: string } = new QuestionValidator(question)
                    .checkId()
                    .checkText()
                    .checkType()
                    .checkPoints()
                    .checkChoices()
                    .compile();
                if (result.compilationError) {
                    this.compilationError += result.compilationError;
                } else {
                    this.newQuiz.questions.push(result.question);
                }
            }
        });

        return this;
    }

    async compile(): Promise<{ quiz: Quiz; compilationError: string }> {
        for (const task of this.tasks) {
            await task();
        }
        this.newQuiz.lastModification = new Date();
        this.newQuiz.visible = false;

        return { quiz: this.newQuiz, compilationError: this.compilationError };
    }

    private checkType(): QuizValidator {
        this.tasks.push(async () => {
            if (!this.quiz || typeof this.quiz !== 'object') {
                this.compilationError += 'Quiz : doit être un objet !\n';
                this.isObject = false;
                return;
            }
            this.isObject = true;
        });

        return this;
    }
}
