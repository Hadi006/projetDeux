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
}
