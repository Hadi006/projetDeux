import { LobbiesService } from '@app/services/lobbies.service';
import { LobbyData } from '@common/lobby-data';
import { Request, Response, Router } from 'express';
import httpStatus from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class LobbyController {
    router: Router;

    constructor(private readonly lobbiesService: LobbiesService) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response) => {
            const lobbies: LobbyData[] = await this.lobbiesService.getLobbies();
            res.status(lobbies.length === 0 ? httpStatus.NOT_FOUND : httpStatus.OK).json(lobbies);
        });
    }
}
