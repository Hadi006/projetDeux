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
}
