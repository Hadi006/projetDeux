import { QuestionBankService } from '@app/services/question-bank/question-bank.service';
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
            const questions: Question[] = await this.questionBankService.getQuestions();
            res.status(questions.length === 0 ? httpStatus.NOT_FOUND : httpStatus.OK).json(questions);
        });

        this.router.post('/', async (req: Request, res: Response) => {
            const result = this.questionBankService.validateQuestion(req.body.question);
            if (!result.error) {
                const added = await this.questionBankService.addQuestion(result.data);
                if (!added) {
                    result.error = 'Question : text must be unique !';
                    res.status(httpStatus.BAD_REQUEST).json(result);
                    return;
                }
                result.data.lastModification = new Date();
            }

            res.status(result.error ? httpStatus.BAD_REQUEST : httpStatus.CREATED).json(result);
        });

        this.router.post('/validate', async (req: Request, res: Response) => {
            const result = this.questionBankService.validateQuestion(req.body.question);

            res.status(result.error ? httpStatus.BAD_REQUEST : httpStatus.OK).json(result);
        });

        this.router.patch('/:questionText', async (req: Request, res: Response) => {
            const result = this.questionBankService.validateQuestion(req.body.question);
            if (!result.error) {
                result.data.lastModification = new Date();
                const updated = await this.questionBankService.updateQuestion(result.data, req.params.questionText);
                res.status(updated ? httpStatus.OK : httpStatus.NOT_FOUND).json(result);
                return;
            }

            res.status(httpStatus.BAD_REQUEST).json(result);
        });

        this.router.delete('/:questionText', async (req: Request, res: Response) => {
            const deleted = await this.questionBankService.deleteQuestion(req.params.questionText);
            res.status(deleted ? httpStatus.OK : httpStatus.NOT_FOUND).json({});
        });
    }
}
