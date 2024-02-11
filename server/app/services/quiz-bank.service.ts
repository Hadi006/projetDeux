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
}
