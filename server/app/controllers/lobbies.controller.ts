import { LobbiesService } from './lobbies.service';
import { LobbyData } from '@common/lobby-data';
import { Router } from 'express';
import { Service } from 'typedi';

@Service()
export class LobbyController {
    router: Router;

    constructor(private readonly lobbiesService: LobbiesService) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();
    }
}
