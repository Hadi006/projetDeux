import { Service } from 'typedi';
import { DatabaseService } from './database.service';
import { LobbyData } from '@common/lobby-data';
import { LOBBY_ID_LENGTH, LOBBY_ID_MAX, NEW_LOBBY } from '@common/constant';
import { Quiz } from '@common/quiz';

@Service()
export class LobbiesService {
    constructor(private database: DatabaseService) {}

    async getLobbies(): Promise<LobbyData[]> {
        return await this.database.get<LobbyData>('lobbies');
    }

    async getLobby(lobbyId: string): Promise<LobbyData> {
        return (await this.database.get<LobbyData>('lobbies', { id: lobbyId }))[0];
    }

    async createLobby(quiz: Quiz): Promise<LobbyData | undefined> {
        let id: string;

        const lobbies = await this.getLobbies();

        if (lobbies.length >= LOBBY_ID_MAX) {
            return undefined;
        }

        do {
            id = Math.floor(Math.random() * LOBBY_ID_MAX)
                .toString()
                .padStart(LOBBY_ID_LENGTH, '0');
        } while (lobbies.some((lobby) => lobby.id === id));

        const newLobby: LobbyData = { ...NEW_LOBBY, id, quiz };
        await this.database.add('lobbies', newLobby);
        return newLobby;
    }

    async updateLobby(lobby: LobbyData): Promise<boolean> {
        return await this.database.update('lobbies', { id: lobby.id }, [{ $set: lobby }]);
    }

    async deleteLobby(lobbyId: string): Promise<boolean> {
        return await this.database.delete('lobbies', { id: lobbyId });
    }
}
