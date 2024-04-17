import { Answer } from '@common/quiz';
import { ValidationResult } from '@common/validation-result';
import { CheckProperty } from '../check-property/check-property';

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
        this.checkText();
        this.checkType();
        return this.compile();
    }

    checkText(): void {
        this.tasks.push(() => {
            this.compilationError += CheckProperty.checkIfEmptyString(this.answer, 'text', 'Reponse : texte manquant !\n');
            this.newAnswer.text = this.answer.text;
        });
    }

    checkType(): void {
        this.tasks.push(() => {
            if (!('isCorrect' in this.answer) || typeof this.answer.isCorrect !== 'boolean') {
                this.compilationError += 'Reponse : type manquant !\n';
                return;
            }
            this.newAnswer.isCorrect = this.answer.isCorrect;
        });
    }

    compile(): ValidationResult<Answer> {
        this.tasks.forEach((task) => task());

        return new ValidationResult(this.compilationError, this.newAnswer);
    }
}
