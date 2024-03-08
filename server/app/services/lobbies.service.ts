import { Service } from 'typedi';
import { DatabaseService } from './database.service';
import { LobbyData } from '@common/lobby-data';

@Service()
export class LobbiesService {
    constructor(private database: DatabaseService) {}

    async getLobbies(): Promise<LobbyData[]> {
        return await this.database.get<LobbyData>('lobbies');
    }
}
