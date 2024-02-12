import { QuizBankService } from '@app/services/quiz-bank.service';
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
            const QUIZZES: Quiz[] | null = await this.quizBankService.getQuizzes();
            res.status(QUIZZES ? httpStatus.OK : httpStatus.NOT_FOUND).json(QUIZZES);
        });

        this.router.get('/visible', async (req: Request, res: Response) => {
            const QUIZZES: Quiz[] | null = await this.quizBankService.getVisibleQuizzes();
            res.status(QUIZZES ? httpStatus.OK : httpStatus.NOT_FOUND).json(QUIZZES);
        });

        this.router.get('/:quizId/download', async (req: Request, res: Response) => {
            const QUIZ_ID = req.params.quizId;
            const QUIZ: Quiz | null = await this.quizBankService.exportQuiz(QUIZ_ID);
            if (!QUIZ) {
                res.status(httpStatus.NOT_FOUND).json({});
                return;
            }

            const INDENTATION = 4;
            const STRINGIFIED_QUIZ = JSON.stringify(QUIZ, null, INDENTATION);
            res.setHeader('Content-disposition', 'attachment; filename=quiz.json');
            res.setHeader('Content-type', 'application/json');

            res.status(httpStatus.OK).send(Buffer.from(STRINGIFIED_QUIZ));
        });

        this.router.post('/', async (req: Request, res: Response) => {
            const RESULT: { quiz: Quiz; errorLog: string } = await this.quizBankService.verifyQuiz(req.body.quiz);
            const VALID = !RESULT.errorLog;
            if (VALID) {
                // attention, si addQuiz decouvre que le titre est deja pris, il faut avertir le client que le quiz n'a pas ete ajoute
                await this.quizBankService.addQuiz(RESULT.quiz);
            }

            res.status(VALID ? httpStatus.CREATED : httpStatus.BAD_REQUEST).json(RESULT);
        });

        this.router.patch('/:quizId', async (req: Request, res: Response) => {
            const RESULT: { quiz: Quiz; errorLog: string } = await this.quizBankService.verifyQuiz(req.body.quiz);
            const VALID = RESULT.errorLog.replace('Quiz : title must be unique !\n', '') === '';

            if (VALID) {
                await this.quizBankService.updateQuiz(RESULT.quiz);
                res.status(httpStatus.OK).json({});
                return;
            }

            res.status(httpStatus.BAD_REQUEST).json(RESULT);
        });

        this.router.patch('/:quizId/visibility', async (req: Request, res: Response) => {
            const QUIZ_ID = req.params.quizId;
            const UPDATED = await this.quizBankService.changeQuizVisibility(QUIZ_ID);

            res.status(UPDATED ? httpStatus.OK : httpStatus.NOT_FOUND).json({});
        });

        this.router.delete('/:quizId', async (req: Request, res: Response) => {
            const QUIZ_ID = req.params.quizId;
            await this.quizBankService.deleteQuiz(QUIZ_ID);

            res.status(httpStatus.OK).json({});
        });
    }
}
