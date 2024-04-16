import { QuizValidator } from '@app/classes/quiz-validator/quiz-validator';
import { DatabaseService } from '@app/services/database/database.service';
import { Quiz } from '@common/quiz';
import { QuizQuery } from '@common/quiz-query';
import { ValidationResult } from '@common/validation-result';
import { Request } from 'express';
import { Service } from 'typedi';

@Service()
export class QuizBankService {
    constructor(private database: DatabaseService) {}

    async getQuizzes(req: Request): Promise<Quiz[]> {
        return await this.database.get<Quiz>('quizzes', this.getQuizQuery(req));
    }

    async getQuiz(quizId: string): Promise<Quiz | undefined> {
        return (await this.database.get<Quiz>('quizzes', { id: quizId }))[0];
    }

    async exportQuiz(quizId: string): Promise<Quiz | undefined> {
        const result = (await this.database.get('quizzes', { id: quizId }, { visible: 0 })) as Quiz[];
        // let quiz = result[0];
        // quiz = { ...quiz, questions: [] };
        // result[0]?.questions.forEach((question) => {
        //     quiz.questions.push(question);
        // });
        for (const question of result[0]?.questions) {
            delete question.qrlAnswer;
            delete question.lastModification;
            if (question.type === 'QRL') {
                delete question.choices;
            }
        }
        return result[0] as Quiz;
    }

    async addQuiz(quiz: Quiz) {
        if ((await this.database.get('quizzes', { id: quiz.id })).length > 0) {
            await this.database.update('quizzes', { id: quiz.id }, [{ $set: quiz }]);
            return;
        }
        await this.database.add('quizzes', quiz);
    }

    async updateQuiz(quiz: Quiz) {
        if (!(await this.database.update('quizzes', { id: quiz.id }, [{ $set: quiz }]))) {
            await this.database.add('quizzes', quiz);
        }
    }

    async verifyQuiz(quiz: unknown): Promise<ValidationResult<Quiz>> {
        const quizValidator = new QuizValidator(quiz, async (query: object) => this.database.get<Quiz>('quizzes', query));
        return await quizValidator.validate();
    }

    async changeQuizVisibility(quizId: string): Promise<boolean> {
        return await this.database.update('quizzes', { id: quizId }, [{ $set: { visible: { $not: '$visible' } } }]);
    }

    async deleteQuiz(quizId: string) {
        await this.database.delete('quizzes', { id: quizId });
    }

    private getQuizQuery(req: Request): QuizQuery {
        const quizQuery: QuizQuery = {};

        if (typeof req.query?.id === 'string') {
            quizQuery.id = req.query.id;
        }

        if (typeof req.query?.title === 'string') {
            quizQuery.title = req.query.title;
        }

        if (typeof req.query?.visible === 'string') {
            quizQuery.visible = req.query.visible === 'true';
        }

        if (typeof req.query?.description === 'string') {
            quizQuery.description = req.query.description;
        }

        if (typeof req.query?.duration === 'string' && !isNaN(parseInt(req.query.duration, 10))) {
            quizQuery.duration = parseInt(req.query.duration, 10);
        }

        return quizQuery;
    }
}
