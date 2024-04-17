import { CheckProperty } from '@app/classes/check-property/check-property';
import { QuestionValidator } from '@app/classes/question-validator/question-validator';
import { MAX_DURATION, MIN_DURATION } from '@common/constant';
import { Quiz } from '@common/quiz';
import { ValidationResult } from '@common/validation-result';
import { randomUUID } from 'crypto';

export class QuizValidator {
    private tasks: (() => Promise<void>)[];
    private quiz: Quiz;
    private newQuiz: Quiz;
    private compilationError: string;
    private getData: (query: object) => Promise<Quiz[]>;

    constructor(quiz: unknown, getData: (query: object) => Promise<Quiz[]>) {
        this.tasks = [];
        this.quiz = quiz as Quiz;
        this.getData = getData;
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
    }

    async validate(): Promise<ValidationResult<Quiz>> {
        if (!this.quiz || typeof this.quiz !== 'object') {
            return new ValidationResult('Quiz : doit être un objet !\n', this.newQuiz);
        }

        this.checkId();
        this.checkTitle();
        this.checkDescription();
        this.checkDuration();
        this.checkQuestions();
        this.checkVisibility();
        return await this.compile();
    }

    checkTitle(): void {
        this.tasks.push(async () => {
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
    }

    checkDescription(): void {
        this.tasks.push(async () => {
            this.compilationError += CheckProperty.checkIfEmptyString(this.quiz, 'description', 'Quiz : description manquante !\n');
            this.newQuiz.description = this.quiz.description;
        });
    }

    checkDuration(): void {
        this.tasks.push(async () => {
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
    }

    checkQuestions(): void {
        this.tasks.push(async () => {
            if (!('questions' in this.quiz) || !Array.isArray(this.quiz.questions)) {
                this.compilationError += 'Quiz : questions manquantes !\n';
                return;
            }

            if ((this.quiz.questions as unknown[]).length < 1) {
                this.compilationError += 'Quiz : doit avoir au moins une question !\n';
                return;
            }

            for (const question of this.quiz.questions) {
                const result = new QuestionValidator(question).validate();
                if (result.error) {
                    this.compilationError += result.error;
                } else {
                    this.newQuiz.questions.push(result.data);
                }
            }
        });
    }

    checkVisibility(): void {
        this.tasks.push(async () => {
            if ('visible' in this.quiz && typeof this.quiz.visible === 'boolean') {
                this.newQuiz.visible = this.quiz.visible;
            }
        });
    }

    async compile(): Promise<ValidationResult<Quiz>> {
        for (const task of this.tasks) {
            await task();
        }
        this.newQuiz.lastModification = new Date();

        return new ValidationResult(this.compilationError, this.newQuiz);
    }

    private checkId(): void {
        this.tasks.push(async () => {
            if (!('id' in this.quiz) || typeof this.quiz.id !== 'string' || this.quiz.id === '') {
                this.newQuiz.id = randomUUID();
                return;
            }

            this.newQuiz.id = this.quiz.id;
        });
    }
}
