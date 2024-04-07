import { GameService } from '@app/services/game/game.service';
import { Request, Response, Router } from 'express';
import httpStatus from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GameBankController {
    router: Router;

    constructor(private readonly gameService: GameService) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response) => {
            const games = await this.gameService.getGames();
            if (!games) {
                res.status(httpStatus.NOT_FOUND).json([]);
                return;
            }
            const endedGames = games.filter((game) => game.ended);
            res.status(httpStatus.OK).json(endedGames);
        });

        this.router.delete('/', async (req: Request, res: Response) => {
            await this.gameService.deleteEndedGames();
            res.status(httpStatus.OK).json({});
        });

        this.router.delete('/:pin', async (req: Request, res: Response) => {
            await this.gameService.deleteGame(req.params.pin);
            res.status(httpStatus.OK).json({});
        });
    }
}
