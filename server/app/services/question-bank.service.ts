import { QuestionValidator } from '@app/classes/question-validator';
import { DatabaseService } from '@app/services/database.service';
import { Question } from '@common/quiz';
import { Service } from 'typedi';

@Service()
export class QuestionBankService {
    constructor(private database: DatabaseService) {}

    async getQuestions(): Promise<Question[]> {
        return await this.database.get<Question>('questions');
    }

    async getQuestion(text: string): Promise<Question> {
        return (await this.database.get<Question>('questions', { text }))[0];
    }

    validateQuestion(question: unknown): { question: Question; compilationError: string } {
        return new QuestionValidator(question).checkId().checkText().checkType().checkPoints().checkChoices().compile();
    }

    async updateQuestion(question: Question, id: string): Promise<boolean> {
        return await this.database.update('questions', { id }, [{ $set: question }]);
    }

    async addQuestion(question: Question): Promise<boolean> {
        if (await this.getQuestion(question.text)) {
            return false;
        }
        await this.database.add('questions', question);
        return true;
    }

    async deleteQuestion(questionId: string): Promise<boolean> {
        return await this.database.delete('questions', { id: questionId });
    }

    async validateAnswer(question: Question, playerAnswers: boolean[]): Promise<boolean> {
        if (question.type !== 'QCM') {
            return true;
        }

        for (let i = 0; i < question.choices.length; i++) {
            if (question.choices[i].isCorrect !== playerAnswers[i]) {
                return false;
            }
        }

        return true;
    }
}
