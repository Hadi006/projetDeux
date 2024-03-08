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

        this.router.get('/:lobbyId', async (req: Request, res: Response) => {
            const lobby: LobbyData = await this.lobbiesService.getLobby(req.params.lobbyId);
            res.status(lobby ? httpStatus.OK : httpStatus.NOT_FOUND).json(lobby);
        });

        this.router.post('/', async (req: Request, res: Response) => {
            const added = await this.lobbiesService.addLobby(req.body);
            res.status(added ? httpStatus.CREATED : httpStatus.BAD_REQUEST).json(added);
        });

        this.router.patch('/:lobbyId', async (req: Request, res: Response) => {
            const updated = await this.lobbiesService.updateLobby(req.body);
            res.status(updated ? httpStatus.OK : httpStatus.NOT_FOUND).json(updated);
        });

        this.router.delete('/:lobbyId', async (req: Request, res: Response) => {
            const deleted = await this.lobbiesService.deleteLobby(req.params.lobbyId);
            res.status(deleted ? httpStatus.OK : httpStatus.NOT_FOUND).json(deleted);
        });
    }
}
