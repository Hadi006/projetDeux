import { QuizValidator } from '@app/classes/quiz-validator';
import { DatabaseService } from '@app/services/database.service';
import { Quiz } from '@common/quiz';
import { Service } from 'typedi';

@Service()
export class QuizBankService {
    constructor(private database: DatabaseService) {}

    async getQuizzes(): Promise<Quiz[]> {
        const RESULT = await this.database.get('quizzes');
        return RESULT as Quiz[];
    }

    async exportQuiz(quizId: string): Promise<Quiz | undefined> {
        const RESULT = (await this.database.get('quizzes', { id: quizId }, { visible: 0 })) as Quiz[];
        let quiz = RESULT[0];
        quiz = { ...quiz, questions: [] };
        RESULT[0]?.questions.forEach((question) => {
            delete question.id;
            quiz.questions.push(question);
        });
        return RESULT[0] as Quiz;
    }

    async addQuiz(quiz: Quiz) {
        const RESULT = await this.database.get('quizzes', { id: quiz.id });
        if (RESULT.length > 0) {
            await this.database.update('quizzes', { id: quiz.id }, [{ $set: quiz }]);
            return;
        }
        await this.database.add('quizzes', quiz);
    }

    async updateQuiz(quiz: Quiz) {
        const QUERY = { id: quiz.id };
        const UPDATE = [{ $set: quiz }];
        const UPDATED = await this.database.update('quizzes', QUERY, UPDATE);
        if (!UPDATED) {
            await this.database.add('quizzes', quiz);
        }
    }

    async verifyQuiz(quiz: unknown): Promise<{ quiz: Quiz; errorLog: string }> {
        const QUIZ = new QuizValidator(quiz, async (query: object) => this.database.get<Quiz>('quizzes', query));
        const RESULT = await QUIZ.checkId().checkTitle().checkDescription().checkDuration().checkQuestions().compile();
        return { quiz: RESULT.quiz, errorLog: RESULT.compilationError };
    }

    async changeQuizVisibility(quizId: string): Promise<boolean> {
        const QUERY = { id: quizId };
        const UPDATE = [{ $set: { visible: { $not: '$visible' } } }];
        const UPDATED = await this.database.update('quizzes', QUERY, UPDATE);

        return UPDATED;
    }

    async deleteQuiz(quizId: string) {
        const QUERY = { id: quizId };
        await this.database.delete('quizzes', QUERY);
    }
}
