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
}
