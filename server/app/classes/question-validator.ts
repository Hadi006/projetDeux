import { LOWER_BOUND, MAX_CHOICES, MIN_CHOICES, POINT_INTERVAL, UPPER_BOUND } from '@common/constant';
import { Answer, Question } from '@common/quiz';
import { AnswerValidator } from './answer-validator';

export class QuestionValidator {
    private tasks: (() => void)[];
    private question: Question;
    private newQuestion: Question;
    private compilationError: string;
    constructor(question: unknown) {
        this.tasks = [];
        this.question = question as Question;
        this.compilationError = '';
        this.newQuestion = {
            text: '',
            type: '',
            points: 0,
            choices: [],
        };
    }

    validate(): { question: Question; compilationError: string } {
        if (!this.question || typeof this.question !== 'object') {
            return { question: this.newQuestion, compilationError: 'Question : doit être un objet !\n' };
        }
        return this.checkText().checkType().checkPoints().checkChoices().compile();
    }

    checkText(): QuestionValidator {
        this.tasks.push(() => {
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
            if (!('choices' in this.question) || !Array.isArray(this.question.choices)) {
                this.compilationError += 'Question : choix manquants !\n';
                return;
            }

            if (this.question.choices.length < MIN_CHOICES || this.question.choices.length > MAX_CHOICES) {
                this.compilationError += 'Question : doit avoir entre 2 et 4 choix !\n';
                return;
            }

            if (!this.hasBothCorrectAndIncorrectAnswers(this.question.choices)) {
                this.compilationError += 'Question : doit avoir au moins une bonne et une mauvaise réponse !\n';
            }
        });
        return this;
    }

    compile(): { question: Question; compilationError: string } {
        this.tasks.forEach((task) => task());
        return { question: this.newQuestion, compilationError: this.compilationError };
    }

    private hasBothCorrectAndIncorrectAnswers(choices: Answer[]): boolean {
        let hasCorrectAnswer = false;
        let hasIncorrectAnswer = false;
        for (const choice of choices) {
            const result = new AnswerValidator(choice).validate();
            this.newQuestion.choices.push(result.answer);
            this.compilationError += result.compilationError;

            if (!result.compilationError) {
                hasCorrectAnswer = hasCorrectAnswer || result.answer.isCorrect;
                hasIncorrectAnswer = hasIncorrectAnswer || !result.answer.isCorrect;
            }
        }

        return hasCorrectAnswer && hasIncorrectAnswer;
    }
}
