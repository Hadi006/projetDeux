import { QuestionBankService } from '@app/services/question-bank.service';
import { Question } from '@common/quiz';
import { Request, Response, Router } from 'express';
import httpStatus from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class QuestionBankController {
    router: Router;

    constructor(private readonly questionBankService: QuestionBankService) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response) => {
            const QUESTIONS: Question[] = await this.questionBankService.getQuestions();
            res.status(QUESTIONS.length === 0 ? httpStatus.NOT_FOUND : httpStatus.OK).json(QUESTIONS);
        });

        this.router.post('/', async (req: Request, res: Response) => {
            const QUESTION: unknown = req.body.question;
            const RESULT: { question: Question; compilationError: string } = this.questionBankService.validateQuestion(QUESTION);
            if (!RESULT.compilationError) {
                const ADDED = await this.questionBankService.addQuestion(RESULT.question);
                if (!ADDED) {
                    RESULT.compilationError = 'Question : text must be unique !';
                    res.status(httpStatus.BAD_REQUEST).json(RESULT);
                    return;
                }
                RESULT.question.lastModification = new Date();
            }

            res.status(RESULT.compilationError ? httpStatus.BAD_REQUEST : httpStatus.CREATED).json(RESULT);
        });

        this.router.post('/validate', async (req: Request, res: Response) => {
            const QUESTION: unknown = req.body.question;
            const RESULT: { question: Question; compilationError: string } = this.questionBankService.validateQuestion(QUESTION);

            res.status(RESULT.compilationError ? httpStatus.BAD_REQUEST : httpStatus.OK).json(RESULT);
        });

        this.router.patch('/:questionId', async (req: Request, res: Response) => {
            const QUESTION: unknown = req.body.question;
            const RESULT: { question: Question; compilationError: string } = this.questionBankService.validateQuestion(QUESTION);
            if (!RESULT.compilationError) {
                RESULT.question.lastModification = new Date();
                const result = await this.questionBankService.updateQuestion(RESULT.question, req.params.questionId);
                res.status(result ? httpStatus.OK : httpStatus.NOT_FOUND).json(RESULT);
                return;
            }

            res.status(httpStatus.BAD_REQUEST).json(RESULT);
        });

        this.router.post('/:questionId/validate-answer', async (req: Request, res: Response) => {
            const QUESTION_ID: string = req.params.questionId;
            const ANSWER = req.body.answer;
            const QUESTION = await this.questionBankService.getQuestion(QUESTION_ID);
            if (!QUESTION) {
                res.status(httpStatus.NOT_FOUND).json({});
                return;
            }

            const RESULT = this.questionBankService.validateAnswer(QUESTION, ANSWER);
            res.status(httpStatus.OK).json(RESULT);
        });

        this.router.delete('/:questionId', async (req: Request, res: Response) => {
            const QUESTION_ID: string = req.params.questionId;
            const DELETED = await this.questionBankService.deleteQuestion(QUESTION_ID);
            res.status(DELETED ? httpStatus.OK : httpStatus.NOT_FOUND).json({});
        });
    }
}
