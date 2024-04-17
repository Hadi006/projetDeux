import { AnswerValidator } from '@app/classes/answer-validator/answer-validator';
import { CheckProperty } from '@app/classes/check-property/check-property';
import { LOWER_BOUND, MAX_CHOICES, MIN_CHOICES, POINT_INTERVAL, QuestionType, UPPER_BOUND } from '@common/constant';
import { Answer, Question } from '@common/quiz';
import { ValidationResult } from '@common/validation-result';

export class QuestionValidator {
    private tasks: (() => void)[];
    private question: Question;
    private newQuestion: Question;
    private compilationError: string;
    constructor(question: unknown) {
        this.tasks = [];
        this.question = question as Question;
        this.compilationError = '';
        this.newQuestion = {
            text: '',
            type: '',
            points: 0,
            choices: [],
            qrlAnswer: '',
        };
    }

    validate(): ValidationResult<Question> {
        if (!this.question || typeof this.question !== 'object') {
            return new ValidationResult('Question : doit être un objet !\n', this.newQuestion);
        }

        this.checkText();
        this.checkType();
        this.checkPoints();
        this.checkChoices();
        return this.compile();
    }

    checkText(): void {
        this.tasks.push(() => {
            this.compilationError += CheckProperty.checkIfEmptyString(this.question, 'text', 'Question : texte manquant !\n');
            this.newQuestion.text = this.question.text;
        });
    }

    checkType(): void {
        this.tasks.push(() => {
            if (!('type' in this.question) || typeof this.question.type !== 'string') {
                this.compilationError += 'Question : type manquant !\n';
                return;
            }
            if (this.question.type !== QuestionType.Qcm && this.question.type !== QuestionType.Qrl) {
                this.compilationError += 'Question : type doit être QCM ou QRL !\n';
                return;
            }
            this.newQuestion.type = this.question.type;
        });
    }

    checkPoints(): void {
        this.tasks.push(() => {
            if (!('points' in this.question) || typeof this.question.points !== 'number') {
                this.compilationError += 'Question : points manquants !\n';
                return;
            }

            if (this.question.points % POINT_INTERVAL !== 0 || this.question.points < LOWER_BOUND || this.question.points > UPPER_BOUND) {
                this.compilationError += 'Question : points doit être un multiple de 10 et entre 10 et 100 !\n';
                return;
            }
            this.newQuestion.points = this.question.points;
        });
    }

    checkChoices(): void {
        this.tasks.push(() => {
            if (this.newQuestion.type === QuestionType.Qrl) {
                return;
            }

            if (!('choices' in this.question) || !Array.isArray(this.question.choices)) {
                this.compilationError += 'Question : choix manquants !\n';
                return;
            }

            if (this.question.choices.length < MIN_CHOICES || this.question.choices.length > MAX_CHOICES) {
                this.compilationError += 'Question : doit avoir entre 2 et 4 choix !\n';
                return;
            }

            if (!this.hasBothCorrectAndIncorrectAnswers(this.question.choices)) {
                this.compilationError += 'Question : doit avoir au moins une bonne et une mauvaise réponse !\n';
            }
        });
    }

    compile(): ValidationResult<Question> {
        this.tasks.forEach((task) => task());
        return new ValidationResult(this.compilationError, this.newQuestion);
    }

    private hasBothCorrectAndIncorrectAnswers(choices: Answer[]): boolean {
        let hasCorrectAnswer = false;
        let hasIncorrectAnswer = false;
        for (const choice of choices) {
            const result = new AnswerValidator(choice).validate();
            this.newQuestion.choices.push(result.data);
            this.compilationError += result.error;

            if (!result.error) {
                hasCorrectAnswer = hasCorrectAnswer || result.data.isCorrect;
                hasIncorrectAnswer = hasIncorrectAnswer || !result.data.isCorrect;
            }
        }

        return hasCorrectAnswer && hasIncorrectAnswer;
    }
}
