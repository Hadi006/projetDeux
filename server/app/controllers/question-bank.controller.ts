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
}
