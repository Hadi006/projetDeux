import { QuizBankService } from '@app/services/quiz-bank.service';
import { INDENTATION } from '@common/constant';
import { Quiz } from '@common/quiz';
import { Request, Response, Router } from 'express';
import httpStatus from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class QuizBankController {
    router: Router;

    constructor(private readonly quizBankService: QuizBankService) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response) => {
            const quizzes: Quiz[] | null = await this.quizBankService.getQuizzes();
            res.status(quizzes ? httpStatus.OK : httpStatus.NOT_FOUND).json(quizzes);
        });

        this.router.get('/visible', async (req: Request, res: Response) => {
            const quizzes: Quiz[] | null = await this.quizBankService.getVisibleQuizzes();
            res.status(quizzes ? httpStatus.OK : httpStatus.NOT_FOUND).json(quizzes);
        });

        this.router.get('/:quizId', async (req: Request, res: Response) => {
            const quiz: Quiz | null = await this.quizBankService.getQuiz(req.params.quizId);
            res.status(quiz ? httpStatus.OK : httpStatus.NOT_FOUND).json(quiz);
        });

        this.router.get('/:quizId/download', async (req: Request, res: Response) => {
            const quiz: Quiz | null = await this.quizBankService.exportQuiz(req.params.quizId);
            if (!quiz) {
                res.status(httpStatus.NOT_FOUND).json({});
                return;
            }

            res.setHeader('Content-disposition', 'attachment; filename=quiz.json');
            res.setHeader('Content-type', 'application/json');

            res.status(httpStatus.OK).send(Buffer.from(JSON.stringify(quiz, null, INDENTATION)));
        });

        this.router.post('/', async (req: Request, res: Response) => {
            if (req.body.newTitle) {
                req.body.quiz.title = req.body.newTitle;
            }
            const result: { quiz: Quiz; errorLog: string } = await this.quizBankService.verifyQuiz(req.body.quiz);
            if (!result.errorLog) {
                await this.quizBankService.addQuiz(result.quiz);
            }

            res.status(!result.errorLog ? httpStatus.CREATED : httpStatus.BAD_REQUEST).json(result);
        });

        this.router.patch('/:quizId', async (req: Request, res: Response) => {
            const result: { quiz: Quiz; errorLog: string } = await this.quizBankService.verifyQuiz(req.body.quiz);

            if (result.errorLog.replace('Quiz : titre déjà utilisé !\n', '') === '') {
                await this.quizBankService.updateQuiz(result.quiz);
                res.status(httpStatus.OK).json({});
                return;
            }

            res.status(httpStatus.BAD_REQUEST).json(result);
        });

        this.router.patch('/:quizId/visibility', async (req: Request, res: Response) => {
            if (await this.quizBankService.changeQuizVisibility(req.params.quizId)) {
                res.status(httpStatus.OK).json({});
                return;
            }

            res.status(httpStatus.NOT_FOUND).json({});
        });

        this.router.delete('/:quizId', async (req: Request, res: Response) => {
            await this.quizBankService.deleteQuiz(req.params.quizId);

            res.status(httpStatus.OK).json({});
        });
    }
}
