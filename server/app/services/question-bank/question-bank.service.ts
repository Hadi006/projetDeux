import { QuestionValidator } from '@app/classes/question-validator/question-validator';
import { DatabaseService } from '@app/services/database/database.service';
import { Question } from '@common/quiz';
import { ValidationResult } from '@common/validation-result';
import { Service } from 'typedi';
import { Request } from 'express';
import { QuestionQuery } from '@common/question-query';

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
    async getQuestions(req: Request): Promise<Question[]> {
        return await this.database.get<Question>('questions', this.getQuestionQuery(req));
    }

    private async getQuestion(text: string): Promise<Question> {
        return (await this.database.get<Question>('questions', { text }))[0];
    }

    private getQuestionQuery(req: Request): QuestionQuery {
        const questionQuery: QuestionQuery = {};

        if (typeof req.query?.text === 'string') {
            questionQuery.text = req.query.text;
        }

        if (typeof req.query?.type === 'string' && (req.query.type === 'QCM' || req.query.type === 'QRL')) {
            questionQuery.type = req.query.type;
        }

        if (typeof req.query?.points === 'string') {
            questionQuery.points = parseInt(req.query.points, 10);
        }

        return questionQuery;
    }
}
