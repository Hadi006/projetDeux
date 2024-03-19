import { Answer } from '@common/quiz';

export class AnswerValidator {
    private tasks: (() => void)[];
    private answer: Answer;
    private newAnswer: Answer;
    private compilationError: string;

    constructor(answer: unknown) {
        this.tasks = [];
        this.answer = answer as Answer;
        this.compilationError = '';
        this.newAnswer = {
            text: '',
            isCorrect: false,
        };
    }

    validate(): { answer: Answer; compilationError: string } {
        if (!this.answer || typeof this.answer !== 'object') {
            return { answer: this.newAnswer, compilationError: 'Reponse : doit être un objet !\n' };
        }
        return this.checkText().checkType().compile();
    }

    checkText(): AnswerValidator {
        this.tasks.push(() => {
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
}
