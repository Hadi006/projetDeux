import { Question } from '@common/quiz';
import { randomUUID } from 'crypto';

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
}
