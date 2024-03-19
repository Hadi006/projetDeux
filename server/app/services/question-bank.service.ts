import { QuestionValidator } from '@app/classes/question-validator';
import { DatabaseService } from '@app/services/database.service';
import { Question } from '@common/quiz';
import { ValidationResult } from '@common/validation-result';
import { Service } from 'typedi';

@Service()
export class QuestionBankService {
    constructor(private database: DatabaseService) {}

    validateQuestion(question: unknown): ValidationResult<Question> {
        return new QuestionValidator(question).validate();
    }

    async updateQuestion(question: Question, text: string): Promise<boolean> {
        return await this.database.update('questions', { text }, [{ $set: question }]);
    }

    async addQuestion(question: Question): Promise<boolean> {
        if (await this.getQuestion(question.text)) {
            return false;
        }
        await this.database.add('questions', question);
        return true;
    }

    async deleteQuestion(questionText: string): Promise<boolean> {
        return await this.database.delete('questions', { text: questionText });
    }
    async getQuestions(): Promise<Question[]> {
        return await this.database.get<Question>('questions');
    }

    private async getQuestion(text: string): Promise<Question> {
        return (await this.database.get<Question>('questions', { text }))[0];
    }
}
