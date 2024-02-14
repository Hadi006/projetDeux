import { Answer } from '@common/quiz';

export class AnswerValidator {
    private tasks: (() => void)[];
    private answer: Answer;
    private newAnswer: Answer;
    private compilationError: string;
    private isObject: boolean;

    constructor(answer: unknown) {
        this.tasks = [];
        this.answer = answer as Answer;
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

            if (!('text' in this.answer) || typeof this.answer.text !== 'string' || this.answer.text === '') {
                this.compilationError += 'Reponse : texte manquant !\n';
                return;
            }
            this.newAnswer.text = this.answer.text;
        });
        return this;
    }

    checkType(): AnswerValidator {
        this.tasks.push(() => {
            if (!this.isObject) {
                return;
            }

            if (!('isCorrect' in this.answer) || typeof this.answer.isCorrect !== 'boolean') {
                this.compilationError += 'Reponse : type manquant !\n';
                return;
            }
            this.newAnswer.isCorrect = this.answer.isCorrect;
        });
        return this;
    }

    compile(): { answer: Answer; compilationError: string } {
        this.tasks.forEach((task) => task());

        return { answer: this.newAnswer, compilationError: this.compilationError };
    }

    private checkObject(): AnswerValidator {
        this.tasks.push(() => {
            if (!this.answer || typeof this.answer !== 'object') {
                this.compilationError += 'Reponse : doit etre un objet !\n';
                this.isObject = false;
                return;
            }
            this.isObject = true;
        });
        return this;
    }
}
