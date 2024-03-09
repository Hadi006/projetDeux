import { Service } from 'typedi';
import { DatabaseService } from './database.service';
import { LobbyData } from '@common/lobby-data';
import { LOBBY_ID_CHARACTERS, LOBBY_ID_LENGTH } from '@common/constant';

@Service()
export class LobbiesService {
    constructor(private database: DatabaseService) {}

    async getLobby(lobbyId: string): Promise<LobbyData> {
        return (await this.database.get<LobbyData>('lobbies', { id: lobbyId }))[0];
    }

    async addLobby(lobby: LobbyData): Promise<boolean> {
        if (await this.getLobby(lobby.id)) {
            return false;
        }
        await this.database.add('lobbies', lobby);
        return true;
    }

    async updateLobby(lobby: LobbyData): Promise<boolean> {
        return await this.database.update('lobbies', { id: lobby.id }, [{ $set: lobby }]);
    }

    async deleteLobby(lobbyId: string): Promise<boolean> {
        return await this.database.delete('lobbies', { id: lobbyId });
    }

    private generateLobbyId(): string {
        let result = '';

        for (let i = 0; i < LOBBY_ID_LENGTH; i++) {
            result += LOBBY_ID_CHARACTERS.charAt(Math.floor(Math.random() * LOBBY_ID_CHARACTERS.length));
        }

        return result;
    }
}
