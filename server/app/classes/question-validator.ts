import { Question } from '@common/quiz';

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
}
