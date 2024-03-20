import { Answer } from '@common/quiz';
import { ValidationResult } from '@common/validation-result';

export class AnswerValidator {
    private tasks: (() => void)[];
    private answer: Answer;
    private newAnswer: Answer;
    private compilationError: string;

    constructor(answer: unknown) {
        this.tasks = [];
        this.answer = answer as Answer;
        this.compilationError = '';
        this.newAnswer = new Answer();
    }

    validate(): ValidationResult<Answer> {
        if (!this.answer || typeof this.answer !== 'object') {
            return new ValidationResult('Reponse : doit être un objet !\n', this.newAnswer);
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

    compile(): ValidationResult<Answer> {
        this.tasks.forEach((task) => task());

        return new ValidationResult(this.compilationError, this.newAnswer);
    }
}
