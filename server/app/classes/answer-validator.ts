import { Answer } from '@common/quiz';

export class AnswerValidator {
    private tasks: (() => void)[];
    private answer: unknown;
    private newAnswer: Answer;
    private compilationError: string;
    private isObject: boolean;

    constructor(answer: unknown) {
        this.tasks = [];
        this.answer = answer;
        this.compilationError = '';
        this.isObject = false;
        this.newAnswer = {
            text: '',
            isCorrect: false,
        };
        this.checkObject();
    }

    checkText(): AnswerValidator {
        this.tasks.push(() => {
            if (!this.isObject) {
                return;
            }

            const ANSWER = this.answer as Answer;
            if (!('text' in ANSWER) || typeof ANSWER.text !== 'string' || ANSWER.text === '') {
                this.compilationError += 'Answer : text is missing !\n';
                return;
            }
            this.newAnswer.text = ANSWER.text;
        });
        return this;
    }

    checkType(): AnswerValidator {
        this.tasks.push(() => {
            if (!this.isObject) {
                return;
            }

            const ANSWER = this.answer as Answer;
            if (!('isCorrect' in ANSWER) || typeof ANSWER.isCorrect !== 'boolean') {
                this.compilationError += 'Answer : type is missing !\n';
                return;
            }
            this.newAnswer.isCorrect = ANSWER.isCorrect;
        });
        return this;
    }
}
