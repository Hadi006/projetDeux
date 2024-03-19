import { QuizValidator } from '@app/classes/quiz-validator';
import { DatabaseService } from '@app/services/database.service';
import { Quiz } from '@common/quiz';
import { Service } from 'typedi';

@Service()
export class QuizBankService {
    constructor(private database: DatabaseService) {}

    async getQuizzes(): Promise<Quiz[]> {
        return await this.database.get<Quiz>('quizzes');
    }

    async getQuiz(quizId: string): Promise<Quiz | undefined> {
        return (await this.database.get<Quiz>('quizzes', { id: quizId }))[0];
    }

    async getVisibleQuizzes(): Promise<Quiz[]> {
        return await this.database.get<Quiz>('quizzes', { visible: true });
    }

    async exportQuiz(quizId: string): Promise<Quiz | undefined> {
        const result = (await this.database.get('quizzes', { id: quizId }, { visible: 0 })) as Quiz[];
        let quiz = result[0];
        quiz = { ...quiz, questions: [] };
        result[0]?.questions.forEach((question) => {
            quiz.questions.push(question);
        });
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

    async verifyQuiz(quiz: unknown): Promise<{ quiz: Quiz; errorLog: string }> {
        const quizValidator = new QuizValidator(quiz, async (query: object) => this.database.get<Quiz>('quizzes', query));
        const result = await quizValidator.validate();
        return { quiz: result.quiz, errorLog: result.compilationError };
    }

    async changeQuizVisibility(quizId: string): Promise<boolean> {
        return await this.database.update('quizzes', { id: quizId }, [{ $set: { visible: { $not: '$visible' } } }]);
    }

    async deleteQuiz(quizId: string) {
        await this.database.delete('quizzes', { id: quizId });
    }
}
