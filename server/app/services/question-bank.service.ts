import { QuestionValidator } from '@app/classes/question-validator';
import { DatabaseService } from '@app/services/database.service';
import { Question } from '@common/quiz';
import { randomUUID } from 'crypto';
import { Service } from 'typedi';

@Service()
export class QuestionBankService {
    constructor(private database: DatabaseService) {}

    async getQuestions(): Promise<Question[]> {
        const QUESTIONS = await this.database.get<Question>('questions');
        return QUESTIONS;
    }

    async getQuestion(id: string): Promise<Question> {
        const QUESTION = (await this.database.get<Question>('questions', { id }))[0];
        return QUESTION;
    }

    validateQuestion(question: unknown): { question: Question; compilationError: string } {
        const QUESTION = new QuestionValidator(question);
        const RESULT = QUESTION.checkId().checkText().checkType().checkPoints().checkChoices().compile();

        return RESULT;
    }

    async updateQuestion(question: Question, id: string): Promise<boolean> {
        return await this.database.update('questions', { id }, [{ $set: question }]);
    }

    async addQuestion(question: Question): Promise<boolean> {
        question.id = randomUUID();
        const SAME_NAMES = await this.database.get<Question>('questions', { text: question.text });
        if (SAME_NAMES.length > 0) {
            return false;
        }
        await this.database.add('questions', question);
        return true;
    }

    async deleteQuestion(questionId: string): Promise<boolean> {
        return await this.database.delete('questions', { id: questionId });
    }

    async validateAnswer(question: Question, playerAnswers: boolean[]): Promise<boolean> {
        if (question.type === 'multiple-choices') {
            return true;
        }

        const CORRECT_ANSWERS = question.choices.filter((choice) => choice.isCorrect);

        const allCheckedAreCorrect = playerAnswers.every((checked, index) => {
            return !checked || (checked && CORRECT_ANSWERS.includes(question.choices[index]));
        });

        const allCorrectAreChecked = CORRECT_ANSWERS.every((correctAnswer) => {
            return playerAnswers[question.choices.indexOf(correctAnswer)];
        });

        return allCheckedAreCorrect && allCorrectAreChecked;
    }
}
