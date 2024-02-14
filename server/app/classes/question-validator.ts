import { LOWER_BOUND, MAX_CHOICES, MIN_CHOICES, POINT_INTERVAL, UPPER_BOUND } from '@common/constant';
import { Answer, Question } from '@common/quiz';
import { randomUUID } from 'crypto';
import { AnswerValidator } from './answer-validator';

export class QuestionValidator {
    private tasks: (() => void)[];
    private question: Question;
    private newQuestion: Question;
    private compilationError: string;
    private isObject: boolean;

    constructor(question: unknown) {
        this.tasks = [];
        this.question = question as Question;
        this.isObject = false;
        this.compilationError = '';
        this.newQuestion = {
            id: undefined,
            text: '',
            type: '',
            points: 0,
            choices: [],
        };
        this.checkObject();
    }

    checkId(): QuestionValidator {
        this.tasks.push(() => {
            if (!this.isObject) {
                return;
            }

            if (!('id' in this.question) || !(typeof this.question.id === 'string') || this.question.id === '') {
                this.newQuestion.id = randomUUID();
                return;
            }
            this.newQuestion.id = this.question.id;
        });
        return this;
    }

    checkText(): QuestionValidator {
        this.tasks.push(async () => {
            if (!this.isObject) {
                return;
            }

            if (!('text' in this.question) || typeof this.question.text !== 'string' || this.question.text === '') {
                this.compilationError += 'Question : texte manquant !\n';
                return;
            }

            this.newQuestion.text = this.question.text;
        });
        return this;
    }

    checkType(): QuestionValidator {
        this.tasks.push(() => {
            if (!this.isObject) {
                return;
            }

            if (!('type' in this.question) || typeof this.question.type !== 'string') {
                this.compilationError += 'Question : type manquant !\n';
                return;
            }
            if (this.question.type !== 'QCM' && this.question.type !== 'QRL') {
                this.compilationError += 'Question : type doit être QCM ou QRL !\n';
                return;
            }
            this.newQuestion.type = this.question.type;
        });
        return this;
    }

    checkPoints(): QuestionValidator {
        this.tasks.push(() => {
            if (!this.isObject) {
                return;
            }

            if (!('points' in this.question) || typeof this.question.points !== 'number') {
                this.compilationError += 'Question : points manquants !\n';
                return;
            }

            if (this.question.points % POINT_INTERVAL !== 0 || this.question.points < LOWER_BOUND || this.question.points > UPPER_BOUND) {
                this.compilationError += 'Question : points doit être un multiple de 10 et entre 10 et 100 !\n';
                return;
            }
            this.newQuestion.points = this.question.points;
        });
        return this;
    }

    checkChoices(): QuestionValidator {
        this.tasks.push(() => {
            if (!this.isObject) {
                return;
            }

            if (!('choices' in this.question) || !Array.isArray(this.question.choices)) {
                this.compilationError += 'Question : choix manquants !\n';
                return;
            }

            if (this.question.choices.length < MIN_CHOICES || this.question.choices.length > MAX_CHOICES) {
                this.compilationError += 'Question : doit avoir entre 2 et 4 choix !\n';
                return;
            }
            let hasCorrectAnswer = false;
            let hasIncorrectAnswer = false;
            for (const choice of this.question.choices) {
                const result: { answer: Answer; compilationError: string } = new AnswerValidator(choice).checkText().checkType().compile();

                this.newQuestion.choices.push(result.answer);
                this.compilationError += result.compilationError;
                if (!result.compilationError) {
                    hasCorrectAnswer = hasCorrectAnswer || result.answer.isCorrect;
                    hasIncorrectAnswer = hasIncorrectAnswer || !result.answer.isCorrect;
                }
            }
            if (!hasCorrectAnswer || !hasIncorrectAnswer) {
                this.compilationError += 'Question : doit avoir au moins une bonne et une mauvaise réponse !\n';
            }
        });
        return this;
    }

    compile(): { question: Question; compilationError: string } {
        this.tasks.forEach((task) => task());
        return { question: this.newQuestion, compilationError: this.compilationError };
    }

    private checkObject(): QuestionValidator {
        this.tasks.push(() => {
            if (!this.question || typeof this.question !== 'object') {
                this.compilationError += 'Question : doit être un objet !\n';
                this.isObject = false;
                return;
            }
            this.isObject = true;
        });
        return this;
    }
}
