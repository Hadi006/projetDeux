import { Answer, Question } from '@common/quiz';
import { randomUUID } from 'crypto';
import { AnswerValidator } from './answer-validator';

export class QuestionValidator {
    private tasks: (() => void)[];
    private question: unknown;
    private newQuestion: Question;
    private compilationError: string;
    private isObject: boolean;

    constructor(question: unknown) {
        this.tasks = [];
        this.question = question;
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
            const QUESTION = this.question as Question;
            if (!('id' in QUESTION) || !(typeof QUESTION.id === 'string') || QUESTION.id === '') {
                this.newQuestion.id = randomUUID();
                return;
            }
            this.newQuestion.id = QUESTION.id;
        });
        return this;
    }

    checkText(): QuestionValidator {
        this.tasks.push(async () => {
            if (!this.isObject) {
                return;
            }

            const QUESTION = this.question as Question;
            if (!('text' in QUESTION) || typeof QUESTION.text !== 'string' || QUESTION.text === '') {
                this.compilationError += 'Question : text is missing !\n';
                return;
            }

            this.newQuestion.text = QUESTION.text;
        });
        return this;
    }

    checkType(): QuestionValidator {
        this.tasks.push(() => {
            if (!this.isObject) {
                return;
            }
            const QUESTION = this.question as Question;
            if (!('type' in QUESTION) || typeof QUESTION.type !== 'string') {
                this.compilationError += 'Question : type is missing !\n';
                return;
            }
            if (QUESTION.type !== 'multiple-choices' && QUESTION.type !== 'open-ended') {
                this.compilationError += 'Question : type must be multiple-choices or open-ended !\n';
                return;
            }
            this.newQuestion.type = QUESTION.type;
        });
        return this;
    }

    checkPoints(): QuestionValidator {
        this.tasks.push(() => {
            if (!this.isObject) {
                return;
            }
            const QUESTION = this.question as Question;
            if (!('points' in QUESTION) || typeof QUESTION.points !== 'number') {
                this.compilationError += 'Question : points are missing !\n';
                return;
            }
            const POINTS = QUESTION.points as number;
            const TEN = 10;
            const LOWER_BOUND = 10;
            const UPPER_BOUND = 100;
            if (POINTS % TEN !== 0 || POINTS < LOWER_BOUND || POINTS > UPPER_BOUND) {
                this.compilationError += 'Question : points must be a multiple of 10 between 10 and 100 !\n';
                return;
            }
            this.newQuestion.points = POINTS;
        });
        return this;
    }

    checkChoices(): QuestionValidator {
        this.tasks.push(() => {
            if (!this.isObject) {
                return;
            }
            const QUESTION = this.question as Question;
            if (!('choices' in QUESTION) || !Array.isArray(QUESTION.choices)) {
                this.compilationError += 'Question : choices are missing !\n';
                return;
            }
            const CHOICES = QUESTION.choices as unknown[];
            const MAX_CHOICES = 4;
            if (CHOICES.length < 2 || CHOICES.length > MAX_CHOICES) {
                this.compilationError += 'Question : must have 2-4 choices !\n';
                return;
            }
            let hasCorrectAnswer = false;
            let hasIncorrectAnswer = false;
            for (const CHOICE of CHOICES) {
                const RESULT: { answer: Answer; compilationError: string } = new AnswerValidator(CHOICE).checkText().checkType().compile();

                this.newQuestion.choices.push(RESULT.answer);
                this.compilationError += RESULT.compilationError;
                if (!RESULT.compilationError) {
                    hasCorrectAnswer = hasCorrectAnswer || RESULT.answer.isCorrect;
                    hasIncorrectAnswer = hasIncorrectAnswer || !RESULT.answer.isCorrect;
                }
            }
            if (!hasCorrectAnswer || !hasIncorrectAnswer) {
                this.compilationError += 'Question : must have at least one correct and one incorrect answer !\n';
            }
        });
        return this;
    }
}
